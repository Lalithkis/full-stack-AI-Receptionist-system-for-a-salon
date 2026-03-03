# Self-Hosted Inbound Voice Agent

This repository contains a low-latency, streaming AI voice agent capable of handling inbound Twilio SIP phone calls via LiveKit Cloud.

The agent uses:
*   **Deepgram** for ultra-fast Speech-To-Text (STT)
*   **Gemini** for low-latency reasoning (LLM)
*   **ElevenLabs** for human-like Text-To-Speech (TTS)
*   **Silero** for Voice Activity Detection (VAD) and interruption/barge-in handling
*   **Airtable** for comprehensive call logging (transcripts, duration, caller ID)

## Prerequisites Checklist

Before running the agent, you must set up the following accounts and acquire their respective API keys.

- [ ] **1. LiveKit Cloud Account**
  - Create a project at [LiveKit Cloud](https://cloud.livekit.io/)
  - Generate a new API Key and API Secret
  - Map to: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` in `.env`

- [ ] **2. Google AI Studio (Gemini)**
  - Go to [Google AI Studio](https://aistudio.google.com/)
  - Generate an API Key
  - Map to: `GEMINI_API_KEY` in `.env`

- [ ] **3. Deepgram Account (STT)**
  - Go to [Deepgram Console](https://console.deepgram.com/)
  - Generate an API Key
  - Map to: `DEEPGRAM_API_KEY` in `.env`

- [ ] **4. ElevenLabs Account (TTS)**
  - Go to [ElevenLabs](https://elevenlabs.io/)
  - Generate an API Key
  - Map to: `ELEVENLABS_API_KEY` in `.env`

- [ ] **5. Airtable Setup (Database)**
  - **Create a Base:** Create a new Airtable base.
  - **Create a Table:** Name the table exactly `call_logs` (or update `.env` if different).
  - **Create Fields:** Ensure these exact fields exist:
    - `caller_number` (Single line text)
    - `duration_seconds` (Number, allow decimals)
    - `transcript` (Long text)
    - `created_at` (Date/Time, or Single line text if handling ISO manually)
  - **Personal Access Token (PAT):** Create a token at [Airtable Developer Hub](https://airtable.com/create/tokens) with `data.records:write` permission. Map to `AIRTABLE_PAT`.
  - **Base ID:** Find the Base ID (looks like `appXXXXXX`) in your base's API docs. Map to `AIRTABLE_BASE_ID`.

- [ ] **6. Twilio SIP Setup**
  - Purchase a Twilio Phone Number.
  - In LiveKit Cloud settings, go to **SIP**.
  - Create a new **SIP Trunk** and **SIP Dispatch Rule**.
  - Configure your Twilio number to point its SIP traffic to the LiveKit Cloud SIP URI. LiveKit Cloud securely manages the Twilio webhook handshake.

## How to Run

1.  **Clone / Download** this directory to your VPS.
2.  **Create a Virtual Environment (Optional but recommended):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Install Requirements:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment:**
    ```bash
    cp .env.example .env
    nano .env # Paste all your keys here
    ```
5.  **Start the Agent:**
    ```bash
    python agent.py start
    ```

As long as this Python worker is running, any phone call hitting your Twilio number will securely route into LiveKit Cloud and wake up this agent to take the call.

## Understanding VAD (Voice Activity Detection)
If the agent cuts the caller off too early, or waits too long to reply, open `agent.py` and adjust the `silero.VAD.load()` parameters.

*   `min_silence_duration`: (Default `0.5s`) Increase this to `0.8s` or `1.0s` if callers pause frequently while speaking.
*   `speech_pad_ms`: (Default `400ms`) Adds invisible padding to speech to prevent words from being clipped.
