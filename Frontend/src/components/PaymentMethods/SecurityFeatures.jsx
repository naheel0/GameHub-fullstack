import React from 'react';
import { FaLock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const SecurityFeatures = () => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Security Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <FaLock className="text-xl" />,
            title: 'SSL Encrypted',
            description: 'All transactions are 256-bit SSL encrypted',
          },
          {
            icon: <FaShieldAlt className="text-xl" />,
            title: 'PCI Compliant',
            description: 'We are PCI DSS Level 1 certified',
          },
          {
            icon: <FaCheckCircle className="text-xl" />,
            title: '3D Secure',
            description: 'Additional security layer for card payments',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-600/50 hover:border-red-500/30 transition duration-300"
          >
            <div className="text-red-500 mb-2 flex justify-center">
              {feature.icon}
            </div>
            <h4 className="font-semibold text-white mb-1">
              {feature.title}
            </h4>
            <p className="text-sm text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityFeatures;
