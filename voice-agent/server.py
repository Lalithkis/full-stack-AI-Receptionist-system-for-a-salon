import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Enable CORS so the React frontend on port 3000 can call this API on port 5000
CORS(app)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
LIVEKIT_SIP_URI = os.getenv("LIVEKIT_SIP_URI")

@app.route('/api/call_me', methods=['POST'])
def call_me():
    data = request.json
    if not data or 'phone_number' not in data:
        return jsonify({"error": "Phone number is required."}), 400

    phone_number = data.get('phone_number')

    # Ensure all required environment variables are set
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, LIVEKIT_SIP_URI]):
        return jsonify({"error": "Server is missing Twilio or LiveKit credentials."}), 500

    try:
        # Initialize the Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # When Twilio calls the user and they answer, Twilio will read this TwiML setup.
        # It tells Twilio to play a short greeting and then use <Dial><Sip> to connect
        # the call to the LiveKit Cloud SIP trunk, which wakes up agent.py.
        twiml = f"""
        <Response>
            <Say>Connecting you to the StyleCut Salon AI receptionist...</Say>
            <Dial>
                <Sip>{LIVEKIT_SIP_URI}</Sip>
            </Dial>
        </Response>
        """
        
        # Create the outbound call
        call = client.calls.create(
            twiml=twiml,
            to=phone_number,
            from_=TWILIO_PHONE_NUMBER
        )
        
        return jsonify({
            "success": True, 
            "call_sid": call.sid, 
            "message": "Call initiated successfully."
        })

    except Exception as e:
        print(f"Twilio API Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Outbound Call Server on port 5000...")
    app.run(port=5000, debug=True)
