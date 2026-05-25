import React from 'react';
import { 
  FaGamepad, 
  FaShippingFast, 
  FaHeadset, 
  FaShieldAlt, 
  FaAward,
  FaUsers,
  FaStar,
  FaTrophy
} from 'react-icons/fa';

const About = () => {
  const stats = [
    { number: "50K+", label: "Happy Gamers", icon: <FaUsers className="text-2xl" /> },
    { number: "5K+", label: "Games Available", icon: <FaGamepad className="text-2xl" /> },
    { number: "24/7", label: "Customer Support", icon: <FaHeadset className="text-2xl" /> },
    { number: "99.9%", label: "Uptime", icon: <FaShieldAlt className="text-2xl" /> }
  ];

  const values = [
    {
      icon: <FaStar className="text-2xl" />,
      title: "Quality First",
      description: "We curate only the best games and ensure top-notch quality in everything we do."
    },
    {
      icon: <FaShippingFast className="text-2xl" />,
      title: "Instant Delivery",
      description: "Get your games instantly with our digital delivery system. No waiting, just playing."
    },
    {
      icon: <FaHeadset className="text-2xl" />,
      title: "24/7 Support",
      description: "Our gaming experts are available round the clock to help you with any issues."
    },
    {
      icon: <FaTrophy className="text-2xl" />,
      title: "Gamer Focused",
      description: "Everything we do is centered around providing the best experience for gamers."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About GameHub</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Your ultimate destination for gaming. We're passionate about bringing the best gaming 
            experiences to players worldwide with instant delivery and unbeatable prices.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-lg text-gray-300 mb-6">
                Founded in 2020, GameHub started as a small passion project by a group of gaming 
                enthusiasts who believed that every gamer deserves instant access to their favorite 
                titles at affordable prices.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                What began as a simple idea has grown into a trusted platform serving thousands of 
                gamers worldwide. We've partnered with major publishers and indie developers alike 
                to bring you the most comprehensive gaming library.
              </p>
              <p className="text-lg text-gray-300">
                Today, we continue to innovate and expand, always keeping our community at the 
                heart of everything we do.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-800">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Gaming Setup"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16 border-t border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">By The Numbers</h2>
            <p className="text-lg text-gray-300">Our impact in the gaming community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-red-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400 border border-red-800">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-300">What drives us every day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-900 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300 border border-gray-800 hover:border-gray-700">
                <div className="bg-red-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400 border border-red-800">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-linear-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaAward className="text-4xl mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl mb-8">
            To revolutionize the way gamers access and enjoy their favorite titles by providing 
            instant, affordable, and reliable gaming experiences to players around the world.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold mb-3 text-red-600">Accessibility</h3>
              <p className="text-gray-800">Making gaming accessible to everyone, everywhere</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold mb-3 text-red-600">Innovation</h3>
              <p className="text-gray-800">Constantly improving and innovating for our community</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold mb-3 text-red-600">Community</h3>
              <p className="text-gray-800">Building a strong, supportive gaming community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Level Up Your Gaming?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of satisfied gamers and discover your next favorite game today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/products'}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 border border-red-600"
            >
              Browse Games
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-transparent hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold border border-gray-600 transition duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;