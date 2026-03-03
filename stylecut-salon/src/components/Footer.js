import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-gold-400">Style</span>
              <span className="text-white">Cut</span> Salon
            </h3>
            <p className="text-gray-300">
              Your premier destination for professional hair styling and care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-gold-400 transition-colors">Home</a></li>
              <li><a href="/services" className="hover:text-gold-400 transition-colors">Services</a></li>
              <li><a href="/team" className="hover:text-gold-400 transition-colors">Team</a></li>
              <li><a href="/contact" className="hover:text-gold-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li>📍 123 Style Street, Fashion District</li>
              <li>📞 (555) 123-4567</li>
              <li>✉️ info@stylecutsalon.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 StyleCut Salon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
