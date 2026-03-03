import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! 👋 I'm your StyleCut virtual assistant. How can I help you book your appointment today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState(null);

  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    setCallStatus(null);
    setPhoneNumber('');
  };

  const handleCallMe = async () => {
    if (!phoneNumber.trim()) return;
    setIsCalling(true);
    setCallStatus(null);
    try {
      const response = await fetch('http://localhost:5000/api/call_me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber })
      });
      const data = await response.json();
      if (response.ok) {
        setCallStatus({ type: 'success', message: 'Calling you now! Please answer your phone.' });
      } else {
        setCallStatus({ type: 'error', message: data.error || 'Failed to initiate call.' });
      }
    } catch (error) {
      setCallStatus({ type: 'error', message: 'Could not connect to the call server.' });
    } finally {
      setIsCalling(false);
    }
  };

  const sessionIdRef = React.useRef(Math.random().toString(36).substring(7));

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://lindsey-fortunate-unsolubly.ngrok-free.dev/webhook/afd15bfe-3b76-47ab-993a-f9d772db5dff/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage,
          sessionId: sessionIdRef.current
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Assuming n8n returns { output: "response text" } or similar.
      // Adjust locally based on your actual n8n output structure.
      // If n8n returns just a string or different JSON, update here.
      // Common pattern is returning the last message content.
      const botResponse = data.output || data.text || (typeof data === 'string' ? data : JSON.stringify(data));

      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { text: `Connection Error: ${error.message}. Please ensure the n8n workflow is ACTIVE.`, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Video_Generation_Salon_Styling_Animation.mp4" type="video/mp4" />
        </video>

        {/* Overlay to ensure text readability against the video */}
        <div className="absolute inset-0 bg-navy-900/40"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg tracking-tight">
            Welcome to <span className="text-gold-400">StyleCut</span> Salon
          </h1>
          <p className="text-xl md:text-3xl mb-8 text-gray-100 font-light tracking-wide drop-shadow-md">
            Where Style Meets Perfection
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-gray-200 drop-shadow-sm">
            Experience luxury hair care with our team of expert stylists.
            From classic cuts to modern styles, we bring your vision to life.
          </p>

          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={toggleChat}
              className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-lg tracking-wider cursor-pointer border-none"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </section>

      {/* Chat Bot Widget (Modal/Popup) */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in-up flex flex-col h-[500px]">
          <div className="bg-navy-900 text-white p-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-lg">StyleCut Assistant</h3>
              <p className="text-xs text-gray-300">Online • Ready to help</p>
            </div>
            <button onClick={toggleChat} className="text-gray-300 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            <div className="flex flex-col space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[80%] p-3 rounded-lg shadow-sm ${msg.sender === 'user'
                    ? 'bg-gold-500 text-white self-end rounded-tr-none'
                    : 'bg-white text-gray-800 self-start rounded-tl-none'
                    }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm self-start max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500"
                disabled={isLoading}
              />
              {/* Voice Trigger Icon */}
              <button
                onClick={toggleVoice}
                className="p-2 text-gray-400 hover:text-gold-500 transition-colors"
                title="Speak"
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`bg-gold-500 text-white p-2 rounded-lg transition-colors ${!inputText.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold-600'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Agent Overlay Indicator (Click-to-Call) */}
      {isVoiceActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-fade-in-up w-[400px]">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold-50 flex items-center justify-center">
              <span className="text-4xl">☎️</span>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-2">Request a Call</h3>
            <p className="text-gray-500 mb-6 text-sm">Enter your phone number and our AI receptionist will call you immediately to book your appointment.</p>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gold-500 text-center text-lg tracking-wider"
              disabled={isCalling}
            />

            {callStatus && (
              <p className={`mb-4 text-sm ${callStatus.type === 'error' ? 'text-red-500' : 'text-green-500 font-bold'}`}>
                {callStatus.message}
              </p>
            )}

            <div className="flex space-x-3 w-full">
              <button
                onClick={toggleVoice}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={isCalling}
              >
                Cancel
              </button>
              <button
                onClick={handleCallMe}
                className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-bold ${!phoneNumber.trim() || isCalling ? 'bg-gold-300 cursor-not-allowed' : 'bg-gold-500 hover:bg-gold-600'
                  }`}
                disabled={!phoneNumber.trim() || isCalling}
              >
                {isCalling ? 'Calling...' : 'Call Me'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Overview */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-navy-900">Our Services</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">Premium hair care services tailored to your needs</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Haircut */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-2xl font-bold mb-3 text-navy-900">Haircuts</h3>
              <p className="text-gray-600 mb-4">
                Expert cuts for all styles - classic, modern, and trendy. Our stylists stay up-to-date with the latest techniques.
              </p>
              <Link to="/services" className="text-gold-500 hover:text-gold-600 font-semibold">
                Learn More →
              </Link>
            </div>

            {/* Coloring */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-3 text-navy-900">Coloring</h3>
              <p className="text-gray-600 mb-4">
                From subtle highlights to bold transformations, we use premium products for vibrant, long-lasting color.
              </p>
              <Link to="/services" className="text-gold-500 hover:text-gold-600 font-semibold">
                Learn More →
              </Link>
            </div>

            {/* Styling */}
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">💇</div>
              <h3 className="text-2xl font-bold mb-3 text-navy-900">Styling</h3>
              <p className="text-gray-600 mb-4">
                Special occasion styling, blowouts, and treatments. Look your best for any event with our styling services.
              </p>
              <Link to="/services" className="text-gold-500 hover:text-gold-600 font-semibold">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-navy-900">Why Choose StyleCut?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy-900">Expert Stylists</h3>
              <p className="text-gray-600">Certified professionals with years of experience</p>
            </div>

            <div className="text-center">
              <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy-900">Premium Products</h3>
              <p className="text-gray-600">We use only the best quality hair care products</p>
            </div>

            <div className="text-center">
              <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy-900">Award Winning</h3>
              <p className="text-gray-600">Recognized for excellence in hair styling</p>
            </div>

            <div className="text-center">
              <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-navy-900">Luxury Experience</h3>
              <p className="text-gray-600">Comfortable ambiance and personalized service</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for a New Look?</h2>
          <p className="text-xl mb-8 text-gray-300">Book your appointment today and let our experts transform your style</p>
          <Link
            to="/contact"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
