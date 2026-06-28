import React from 'react';
import { FaShippingFast, FaShieldAlt, FaHeadset, FaAward } from 'react-icons/fa';

const features = [
  {
    icon: <FaShippingFast className="text-3xl" />,
    title: 'Instant Delivery',
    description: 'Get your games instantly after purchase',
  },
  {
    icon: <FaShieldAlt className="text-3xl" />,
    title: 'Secure Payment',
    description: '100% secure and encrypted transactions',
  },
  {
    icon: <FaHeadset className="text-3xl" />,
    title: '24/7 Support',
    description: 'Round-the-clock customer support',
  },
  {
    icon: <FaAward className="text-3xl" />,
    title: 'Best Prices',
    description: 'Guaranteed lowest prices on all games',
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose GameHub?
          </h2>
          <p className="text-xl text-gray-300">
            The ultimate gaming experience awaits
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300 border border-gray-700"
            >
              <div className="text-red-500 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
