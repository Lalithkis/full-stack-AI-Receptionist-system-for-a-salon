import asyncio
import logging
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit import agents
from livekit.plugins import google, elevenlabs, silero, deepgram
from livekit import rtc
import motor.motor_asyncio

# Load environment variables
load_dotenv()
logger = logging.getLogger("voice-agent")

# --- Configuration & Environment Variables ---
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "stylecut_db")

# Initialize MongoDB client globally
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI) if MONGODB_URI else None
db = mongo_client[MONGODB_DB_NAME] if mongo_client else None
AIRTABLE_PAT = os.getenv("AIRTABLE_PAT")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME", "call_logs")
MAX_CALL_DURATION = int(os.getenv("MAX_CALL_DURATION_SECONDS", "600"))

# Ensure critical APIs are available
if not all([os.getenv("LIVEKIT_URL"), os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")]):
    raise ValueError("Missing LiveKit Cloud environment variables.")

# --- Helper: Airtable Logger ---
def log_to_airtable(caller_number: str, duration: float, transcript: str):
    """
    Safely logs the call details to an Airtable base.
    Wrapped in try/except so it never crashes the running agent.
    """
    if not AIRTABLE_PAT or not AIRTABLE_BASE_ID:
        logger.warning("Airtable credentials missing. Skipping logging.")
        return

    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_PAT}",
        "Content-Type": "application/json"
    }
    
    # Structure the payload based on Airtable field names provided in the spec
    data = {
        "records": [
            {
                "fields": {
                    "caller_number": caller_number,
                    "duration_seconds": round(duration, 1),
                    "transcript": transcript,
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        ]
    }

    try:
        logger.info("Attempting to log call to Airtable...")
        response = requests.post(url, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        logger.info(f"Successfully logged call to Airtable. Record ID: {response.json().get('records')[0].get('id')}")
    except Exception as e:
        logger.error(f"Failed to log to Airtable: {e}")

async def log_to_mongodb(caller_number: str, duration: float, transcript: str):
    """
    Asynchronously logs the call details to MongoDB.
    """
    if not db:
        logger.warning("MongoDB not configured. Skipping MongoDB logging.")
        return
        
    try:
        collection = db["call_logs"]
        record = {
            "caller_number": caller_number,
            "duration_seconds": round(duration, 1),
            "transcript": transcript,
            "created_at": datetime.utcnow()
        }
        result = await collection.insert_one(record)
        logger.info(f"Successfully logged call to MongoDB. Document ID: {result.inserted_id}")
    except Exception as e:
        logger.error(f"Failed to log to MongoDB: {e}")

# --- Helper: Cost Protection ---
async def enforce_max_duration(room: rtc.Room, duration_seconds: int):
    """
    Disconnects the room automatically if it exceeds the maximum duration limits.
    Helps prevent indefinite API billing if a call gets stuck.
    """
    await asyncio.sleep(duration_seconds)
    if room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
        logger.warning(f"Maximum call duration ({duration_seconds}s) reached. Terminating call.")
        await room.disconnect()

# --- Functions (Tools) ---
# --- Functions (Tools) ---
# Helper for dynamically generating available time slots based on typical business hours.
# Monday-Saturday: 09:00 - 20:00 (last booking 19:00)
# Sunday: 10:00 - 18:00 (last booking 17:00)
def generate_available_slots(date_str: str, booked_times: list) -> list:
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        is_sunday = date_obj.weekday() == 6
        
        start_hour = 10 if is_sunday else 9
        end_hour = 18 if is_sunday else 20
        
        # Calculate 1-hour slots
        slots = [f"{hour:02d}:00" for hour in range(start_hour, end_hour)]
        
        # Remove already booked times
        available_slots = [slot for slot in slots if slot not in booked_times]
        return available_slots
    except ValueError:
        return []

class AssistantFunctionContext(llm.FunctionContext):
    """
    This class defines the tools the AI can use during the call.
    Docstrings and annotations are EXTREMELY important here as they tell the LLM
    exactly how and when to use these functions.
    """

    @llm.ai_callable()
    async def check_availability(
        self,
        date: str = llm.TypeInfo(description="The requested date in YYYY-MM-DD format (e.g., '2026-03-05')"),
        time_preference: str = llm.TypeInfo(description="The requested time (e.g., 'morning', 'afternoon', or specific time '14:00')"),
    ) -> str:
        """
        Called when the user asks if there are any available appointment slots for a specific date.
        """
        logger.info(f"Checking availability for Date: {date}, Time: {time_preference}")
        
        # Validate MongoDB connection
        if not db:
            logger.error("MongoDB not connected.")
            return "Internal error: Database is not available. Please tell the user to try again later."

        # Fetch booked slots for the date
        collection = db.appointments
        bookings = await collection.find({"date": date}).to_list(length=50)
        booked_times = [booking["time"] for booking in bookings]
        
        available_slots = generate_available_slots(date, booked_times)
        
        if available_slots:
            return f"Yes, we have the following slots available on {date}: {', '.join(available_slots)}"
        else:
            return f"I'm sorry, we are fully booked on {date} or the date is invalid."

    @llm.ai_callable()
    async def book_appointment(
        self,
        date: str = llm.TypeInfo(description="The date of the appointment in YYYY-MM-DD format."),
        time: str = llm.TypeInfo(description="The specific time of the appointment in HH:MM format."),
        service: str = llm.TypeInfo(description="The salon service requested (e.g., 'Women's Cut', 'Full Color')."),
        user_name: str = llm.TypeInfo(description="The customer's full name."),
    ) -> str:
        """
        Called to finalize an appointment ONLY AFTER confirming a time slot is available using check_availability.
        """
        logger.info(f"Booking {service} for {user_name} on {date} at {time}")
        
        if not db:
            return "Failed to book. Our booking database is currently offline."
            
        collection = db.appointments
        
        # Double check if the slot was taken recently
        existing_booking = await collection.find_one({"date": date, "time": time})
        if existing_booking:
            return f"Failed to book. The time slot {time} on {date} is no longer available. Please ask the user to pick another time."
            
        # Verify it falls within salon hours
        available_slots = generate_available_slots(date, [])
        if time not in available_slots:
             return f"Failed to book. {time} is outside our salon hours on {date}. Please ask the user to pick a valid time."

        # Insert booking
        booking_data = {
            "name": user_name,
            "date": date,
            "time": time,
            "service": service,
            "created_at": datetime.utcnow()
        }
        await collection.insert_one(booking_data)
        
        return f"Success! The appointment for a {service} on {date} at {time} under the name {user_name} is confirmed."


# --- Main Agent Logic ---
async def entrypoint(ctx: JobContext):
    """
    The main entry point for the agent worker.
    """
    system_prompt = os.getenv("SYSTEM_PROMPT", (
        "Identity:\n"
        "You are Nova, the stylish, warm, and professional virtual receptionist for StyleCut Salon. "
        "You are taking an inbound phone call. You have a friendly, welcoming, and modern persona.\n\n"
        "Business Information:\n"
        "Business: StyleCut Salon\n"
        "Specialty: Where Style Meets Perfection. We offer luxury hair care, expert stylists, and modern styles.\n"
        "Location: 123 Fashion Avenue, Downtown.\n\n"
        "Products & Services:\n"
        "• Haircuts: Women's Cut (₹200-500), Men's (₹150), Children's (₹100-200), Bang Trim (₹50)\n"
        "• Coloring: Full Color (₹120+), Highlights (₹150+), Balayage (₹180+), Root Touch-Up (₹85)\n"
        "• Styling & Treatments: Blowout (₹55), Updo (₹85+), Deep Conditioning (₹45), Keratin Treatment (₹250+)\n\n"
        "Hours: Monday to Saturday, 9am to 8pm. Sunday, 10am to 6pm.\n"
        "Booking: Handled via phone call or the website.\n"
        "Pricing: Premium services tailored to individual needs.\n\n"
        "Agent Behavior Guidelines:\n"
        "• Tone: Maintain a warm, friendly, and conversational tone at all times. Speak clearly, concisely, and naturally.\n"
        "• Role: Help customers with booking appointments, service enquiries, pricing questions, and salon information.\n"
        "• Tool Usage: You have access to tools to check calendar availability and book appointments. You MUST use 'check_availability' when a user asks for a time, and you MUST use 'book_appointment' to finalize it. Never assume a slot is open without checking.\n"
        "• Speech Formatting: Do NOT use markdown syntax, asterisks, or emojis since your responses are being read aloud by a Text-to-Speech system.\n"
        "• Honesty: Never make up prices, available time slots, or services that are not listed. If a user asks for a special request not listed, politely ask them to call the main line or visit the website.\n"
        "• Closing: Always end the call warmly and thank the customer for choosing StyleCut Salon."
    ))

    initial_ctx = llm.ChatContext().append(
        role="system",
        text=system_prompt,
    )

    fnc_ctx = AssistantFunctionContext()

    # Note the connection timestamp for the duration calculation
    start_time = datetime.now()

    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 1. Voice Activity Detection (VAD) Tuning
    # Silero requires tuning for your specific use-case so the AI knows exactly when to interrupt.
    vad = silero.VAD.load(
        # min_silence_duration: How long the user must be quiet (in seconds) before the AI considers
        # their turn "finished" and starts responding. 
        # 0.5s is fast and conversational. Increase to 0.8s-1.0s if callers take long pauses.
        min_silence_duration=0.5,
        
        # min_speech_duration: How long a sound must last to be considered user speech.
        # Helps ignore sudden background noises (like a cough or a door closing).
        min_speech_duration=0.1,
        
        # max_buffered_speech: Prevents the agent from buffering infinitely if the line is noisy.
        max_buffered_speech=60.0,
        
        # activation_threshold: Sensitivity to start listening. 0 is highest, 1 is lowest. Default ~0.5.
        activation_threshold=0.5,
        
        # speech_pad_ms: How much padding to add before/after detected speech when sending to STT.
        # This prevents cutting off the very beginning or end of words.
        speech_pad_ms=400 
    )

    # 2. Pipeline Configuration
    agent = VoicePipelineAgent(
        vad=vad,
        # Speech-to-Text: Deepgram is exceptionally fast and handles telephone audio well.
        stt=deepgram.STT(),
        
        # Large Language Model: Gemini is used for ultra-low latency reasoning.
        llm=google.LLM(
            model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
        ),
        
        # Text-to-Speech: ElevenLabs for the most human-like voice delivery.
        tts=elevenlabs.TTS(
            voice=elevenlabs.Voice(
                id=os.getenv("ELEVENLABS_VOICE_ID", "ZUrEGyu8GFMwnHbvLhv2")
            )
        ),
        
        # Tell the LLM about the tools/functions it can use
        fnc_ctx=fnc_ctx,
        
        # Initial context defined above
        chat_ctx=initial_ctx,
        
        # HIGH IMPORTANCE: Barge-in configuration.
        # When True, if the agent is speaking and the user interrupts, the agent stops immediately.
        # It flushes its audio queue and listens to the user.
        allow_interruptions=True,
    )

    # Start the agent listening
    agent.start(ctx.room)
    logger.info("Agent started and listening.")

    # Start the cost protection timer asynchronously
    asyncio.create_task(enforce_max_duration(ctx.room, MAX_CALL_DURATION))

    # Greet the user first (outbound/inbound proactive greeting)
    # We use agent.say() to initiate conversation before STT triggers.
    await agent.say("Hello! Thank you for calling. How can I help you today?", allow_interruptions=True)

    # --- Call Processing & Teardown ---
    
    # We await the disconnection event to trigger our logging workflow
    await ctx.room.wait_for(rtc.RoomEvent.DISCONNECTED)
    logger.info("Call disconnected. Preparing to log data.")
    
    # Calculate exact duration
    end_time = datetime.now()
    duration_secs = (end_time - start_time).total_seconds()

    # Extract the full transcript from the LLM chat array
    # The ChatContext holds all messages (system, user, assistant)
    full_transcript = "\n".join(
        [f"{msg.role.capitalize()}: {msg.text}" for msg in agent.chat_ctx.messages if msg.role in ['user', 'assistant']]
    )

    # Extract Caller Number (If using Twilio SIP via LiveKit)
    # LiveKit Cloud injects SIP metadata into the remote participant's identity/metadata if configured.
    caller_number = "Unknown"
    for participant in ctx.room.remote_participants.values():
        logger.info(f"Participant details: target={participant.identity}, metadata={participant.metadata}")
        # Twilio typically passes the caller ID in the SIP URI or headers, which LiveKit surface here.
        # We capture the identity as the caller number (This assumes properly mapped SIP headers).
        if participant.identity:
            caller_number = participant.identity
        break

    logger.info(f"Final Transcript: {full_transcript}")

    # Finally, offload to Airtable safely
    log_to_airtable(
        caller_number=caller_number,
        duration=duration_secs,
        transcript=full_transcript
    )
    
    # And offload to MongoDB safely
    await log_to_mongodb(
        caller_number=caller_number,
        duration=duration_secs,
        transcript=full_transcript
    )

if __name__ == "__main__":
    # Start the CLI, passing our entrypoint logic.
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
