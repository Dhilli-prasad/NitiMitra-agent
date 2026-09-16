"""NitiMitra welfare scheme assistant Lambda handler."""

import json
import logging
import os
from typing import Any

import boto3


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

_bedrock_agent_runtime = boto3.client("bedrock-agent-runtime")
_cors_headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
    "Content-Type": "application/json",
}

_niti_mitra_instructions = """You are NitiMitra (నీతిమిత్ర / नीतिमित्र), an empathetic, conversational, voice-first welfare discovery assistant for citizens across Bharat.

Follow these rules strictly:
- Respect the requested language exactly: Telugu, Hindi, Kannada, Tamil, or English.
- Be adaptive and conversational. Never return a generic brochure or a long wall of text.
- Keep normal turns concise: 2 to 4 sentences maximum. Only use a structured summary when the user explicitly asks for a full summary.
- Ground every factual assertion strictly in the retrieved government documentation. If the documentation does not contain an answer, say so clearly.
- Never request, verify, store, or output real Aadhaar, PAN, bank account, registration, or other government identification numbers. Refer to them only as generic document concepts.
- When a scheme is mentioned, classify the intent as either a new eligibility/application check or status tracking. If unclear, ask whether the user wants to apply for the first time or check an existing application.
- For eligibility questions, use available profile information, ask only for missing facts needed to evaluate eligibility, and explain the next actionable step.
- For status questions, explain that personal records cannot be fetched in this chat. Give official portal steps and privacy-safe troubleshooting based only on retrieved context.

For PM-KISAN or similar eligibility checks, evaluate age/minor status, cultivable land ownership, and documented exclusion criteria only when supported by retrieved context. Never invent benefit amounts, eligibility rules, deadlines, or links.

When a full summary is explicitly requested, use this concise structure in the requested language:
Overview
Eligibility Verdict
Required Documents Checklist
Next Step / Official Portal
"""


def _response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": _cors_headers,
        "body": json.dumps(body, ensure_ascii=False),
    }


def _request_body(event: dict[str, Any]) -> dict[str, Any]:
    body = event.get("body", event)
    if isinstance(body, str):
        body = json.loads(body)
    if not isinstance(body, dict):
        raise ValueError("Request body must be a JSON object")
    return body


def _citation_sources(citations: Any) -> list[str]:
    sources: list[str] = []
    if not isinstance(citations, list):
        return sources

    for citation in citations:
        if not isinstance(citation, dict):
            continue
        references = citation.get("retrievedReferences", [])
        if not isinstance(references, list):
            continue
        for reference in references:
            if not isinstance(reference, dict):
                continue
            location = reference.get("location", {})
            s3_location = location.get("s3Location", {}) if isinstance(location, dict) else {}
            uri = s3_location.get("uri") if isinstance(s3_location, dict) else None
            content = reference.get("content", {})
            text = content.get("text") if isinstance(content, dict) else None
            source = uri or text
            if isinstance(source, str) and source not in sources:
                sources.append(source)
    return sources


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Handle welfare questions from API Gateway."""
    if event.get("httpMethod") == "OPTIONS":
        return _response(200, {})

    try:
        body = _request_body(event)
        query = body.get("query")
        language = body.get("language", "English")
        session_id = body.get("sessionId")
        citizen_profile = body.get("citizenProfile")

        if not isinstance(query, str) or not query.strip():
            raise ValueError("'query' must be a non-empty string")
        if not isinstance(language, str) or not language.strip():
            raise ValueError("'language' must be a non-empty string")
        if session_id is not None and not isinstance(session_id, str):
            raise ValueError("'sessionId' must be a string")
        if citizen_profile is not None and not isinstance(citizen_profile, dict):
            raise ValueError("'citizenProfile' must be an object")

        knowledge_base_id = os.environ["KNOWLEDGE_BASE_ID"]
        model_arn = os.getenv(
            "MODEL_ARN",
            "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0",
        )
        profile_context = "No citizen profile has been applied."
        if citizen_profile:
            safe_profile = {
                key: citizen_profile.get(key)
                for key in ("age", "annualIncome", "landHoldingAcres", "occupation", "socialCategory", "state")
                if citizen_profile.get(key) not in (None, "")
            }
            profile_context = json.dumps(safe_profile, ensure_ascii=False)
        input_text = (
            f"{_niti_mitra_instructions}\n\n"
            f"Requested response language: {language}\n"
            f"Applied citizen profile (non-identifying categories only): {profile_context}\n\n"
            f"User question: {query.strip()}"
        )

        request: dict[str, Any] = {
            "input": {"text": input_text},
            "retrieveAndGenerateConfiguration": {
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": knowledge_base_id,
                    "modelArn": model_arn,
                },
            },
        }
        if session_id:
            request["sessionId"] = session_id

        result = _bedrock_agent_runtime.retrieve_and_generate(**request)
        output = result.get("output", {})
        answer = output.get("text", "") if isinstance(output, dict) else ""

        return _response(
            200,
            {
                "answer": answer,
                "sessionId": result.get("sessionId"),
                "citations": _citation_sources(result.get("citations", [])),
            },
        )
    except (json.JSONDecodeError, ValueError) as exc:
        return _response(400, {"error": str(exc)})
    except Exception as exc:
        logger.exception("NitiMitra request failed")
        return _response(500, {"error": str(exc)})