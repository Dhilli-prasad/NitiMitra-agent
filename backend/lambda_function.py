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

        if not isinstance(query, str) or not query.strip():
            raise ValueError("'query' must be a non-empty string")
        if not isinstance(language, str) or not language.strip():
            raise ValueError("'language' must be a non-empty string")
        if session_id is not None and not isinstance(session_id, str):
            raise ValueError("'sessionId' must be a string")

        knowledge_base_id = os.environ["KNOWLEDGE_BASE_ID"]
        model_arn = os.getenv(
            "MODEL_ARN",
            "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0",
        )
        input_text = (
            "You are NitiMitra, an empathetic welfare assistant. "
            f"Answer strictly based on retrieved context in the requested language ({language}). "
            "Provide: 1. Overview, 2. Eligibility Criteria, "
            "3. Required Documents Checklist, 4. Official Portal Link. "
            "State clearly if information is missing.\n\n"
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