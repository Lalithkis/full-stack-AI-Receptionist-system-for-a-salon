import React from 'react';

const Team = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Master Stylist & Owner',
      experience: '15 years experience',
      specialties: ['Color Specialist', 'Balayage Expert', 'Bridal Styling'],
      bio: 'Sarah founded StyleCut with a vision to create a welcoming space where clients feel beautiful inside and out. With over 15 years of experience, she specializes in color transformation and has trained extensively in advanced coloring techniques.',
      image: '👩‍🦰',
    },
    {
      name: 'Mike Chen',
      role: 'Senior Stylist',
      experience: '10 years experience',
      specialties: ['Men\'s Cuts', 'Modern Styles', 'Beard Grooming'],
      bio: 'Mike brings a contemporary edge to classic styles. His precision cutting and attention to detail have earned him a loyal following. He stays ahead of trends while ensuring each cut suits his client\'s lifestyle and personality.',
      image: '👨‍🦱',
    },
    {
      name: 'Jessica Martinez',
      role: 'Creative Stylist',
      experience: '8 years experience',
      specialties: ['Creative Color', 'Extensions', 'Keratin Treatments'],
      bio: 'Jessica is known for her artistic approach to hair styling. She loves creating bold, fashion-forward looks and specializes in hair extensions and smoothing treatments. Her warm personality makes every appointment enjoyable.',
      image: '👩‍🦱',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-xl text-gray-300">Talented professionals dedicated to making you look amazing</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {teamMembers.map((member, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex`}
            >
              {/* Image Section */}
              <div className="md:w-1/3 bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center p-12">
                <div className="text-9xl">{member.image}</div>
              </div>

              {/* Content Section */}
              <div className="md:w-2/3 p-8">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-navy-900 mb-2">{member.name}</h2>
                  <p className="text-xl text-gold-500 font-semibold">{member.role}</p>
                  <p className="text-gray-600">{member.experience}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">Specialties:</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, specIdx) => (
                      <span 
                        key={specIdx}
                        className="bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Book with Your Favorite Stylist</h3>
          <p className="text-gray-300 mb-6">
            Each of our stylists brings unique expertise and creativity. Contact us to schedule your appointment!
          </p>
          <a
            href="/contact"
            className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Team;
