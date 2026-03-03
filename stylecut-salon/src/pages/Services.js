import React from 'react';

const Services = () => {
  const services = [
    {
      category: 'Haircuts',
      icon: '✂️',
      items: [
        { name: 'Women\'s Cut', price: '₹200-500', description: 'Professional cut with consultation and styling' },
        { name: 'Men\'s Cut', price: '₹150', description: 'Classic or modern cuts with precision' },
        { name: 'Children\'s Cut', price: '₹100-200', description: 'Gentle and patient service for kids' },
        { name: 'Bang Trim', price: '₹50', description: 'Quick trim to maintain your style' },
      ],
    },
    {
      category: 'Coloring',
      icon: '🎨',
      items: [
        { name: 'Full Color', price: '₹120+', description: 'Complete color transformation' },
        { name: 'Highlights', price: '₹150+', description: 'Partial or full highlights' },
        { name: 'Balayage', price: '₹180+', description: 'Hand-painted natural highlights' },
        { name: 'Root Touch-Up', price: '₹85', description: 'Refresh your root color' },
        { name: 'Color Correction', price: '₹200+', description: 'Fix and restore color issues' },
      ],
    },
    {
      category: 'Styling & Treatments',
      icon: '💇',
      items: [
        { name: 'Blowout', price: '₹55', description: 'Professional wash and style' },
        { name: 'Updo', price: '₹85+', description: 'Elegant styling for special occasions' },
        { name: 'Deep Conditioning', price: '₹45', description: 'Intensive moisture treatment' },
        { name: 'Keratin Treatment', price: '₹250+', description: 'Smoothing and strengthening treatment' },
        { name: 'Hair Extensions', price: '₹300+', description: 'Add length and volume' },
      ],
    },
    {
      category: 'Special Services',
      icon: '✨',
      items: [
        { name: 'Bridal Package', price: '₹250+', description: 'Complete wedding day styling' },
        { name: 'Makeup Application', price: '₹75', description: 'Professional makeup service' },
        { name: 'Perm', price: '₹120+', description: 'Create lasting waves or curls' },
        { name: 'Scalp Treatment', price: '₹65', description: 'Therapeutic scalp care' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Header */}
      <div className="relative py-32 px-4 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Services_Background.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-navy-900/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">Our Services</h1>
          <p className="text-xl text-gray-200 drop-shadow-md">Premium hair care services with competitive pricing</p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {services.map((serviceCategory, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <span className="text-4xl mr-4">{serviceCategory.icon}</span>
                <h2 className="text-3xl font-bold text-navy-900">{serviceCategory.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceCategory.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="border-l-4 border-gold-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-navy-900">{item.name}</h3>
                      <span className="text-gold-500 font-bold text-lg">{item.price}</span>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-navy-900 text-white rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Service Information</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• All services include a complimentary consultation</li>
            <li>• Prices may vary based on hair length and condition</li>
            <li>• We use premium, professional-grade products</li>
            <li>• 24-hour cancellation notice required</li>
            <li>• Gift certificates available</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Services;
