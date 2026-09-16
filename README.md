# NitiMitra (నీతిమిత్ర / नीतिमित्र)

> A voice-first, multilingual civic assistant built to help rural Indian citizens navigate government welfare schemes without getting lost in legal gazettes.

---

## Why We Built This

India has hundreds of central and state welfare initiatives (PM-KISAN, Ayushman Bharat, PMAY, state pensions), but millions of eligible citizens—especially smallholder farmers, elderly pensioners, and daily-wage earners—never get the benefits they qualify for.

The bottleneck isn't the schemes themselves; it's how information reaches the ground:
* **The Gazette Problem:** Official notifications are 30-to-50-page PDF circulars written in dense bureaucratic English or formal Hindi.
* **The Literacy & Typing Gap:** Most government portals assume a user can navigate desktop dropdowns and type in formal text. For many rural citizens, voice in their native dialect is their primary interaction medium.
* **Wasted Footsteps:** People often take unpaid days off work to visit a Common Service Centre (CSC) or revenue office just to find out which documents are required.

We built **NitiMitra** to act like a knowledgeable neighbor at the village panchayat: you talk to it in your native language (**Telugu, Hindi, Tamil, Kannada, or English**), tell it about your situation, and it tells you whether you qualify, what documents you need, and what step to take next.

---

## System Architecture

```text
               [ Citizen / User ]
                       │
       Vernacular Voice│Native Audio
       (Web Speech API)│(SpeechSynthesis)
                       ▼
       ┌───────────────────────────────┐
       │   React + Vite Frontend       │
       │   Hosted on AWS Amplify       │
       │   - Demographic context state │
       │   - Offline document export   │
       │   - WhatsApp sharing          │
       └───────────────┬───────────────┘
                       │ HTTPS POST /chat
                       ▼
       ┌───────────────────────────────┐
       │  Amazon API Gateway (HTTP)    │
       └───────────────┬───────────────┘
                       │ JSON Payload
                       ▼
       ┌───────────────────────────────┐
       │   AWS Lambda (Python 3.12)    │
       │   - Session orchestrator      │
       │   - Normalizes local dialects │
       └───────────────┬───────────────┘
                       │ retrieve_and_generate
                       ▼
       ┌───────────────────────────────────────────────────────────┐
       │             Amazon Bedrock Knowledge Bases                │
       │                                                           │
       │  [ S3 Bucket (Gazettes) ] ──► [ Titan Text Embeddings v2 ]│
       │                                            │              │
       │                                            ▼              │
       │                               [ OpenSearch Serverless ]   │
       │                                            │              │
       │                                            ▼              │
       │                                [ Claude 3.5 Sonnet ]      │
       │                                (Grounding & Reasoning)    │
       └───────────────────────────────────────────────────────────┘
