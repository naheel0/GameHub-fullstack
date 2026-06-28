import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

const AddressesTab = ({ addresses, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading your addresses...</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPinIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Saved Addresses</h3>
        <p className="text-gray-400 mb-6">
          Add addresses for faster checkout on your next purchase.
        </p>
        <p className="text-gray-500 text-sm">
          You can add addresses during the checkout process.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {addresses.map((address, index) => (
        <div
          key={address.id || index}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {address.fullName}
            </h3>
            {address.isDefault && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                Default
              </span>
            )}
          </div>
          <div className="space-y-2 text-gray-300">
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.state} {address.zipCode}
            </p>
            {address.phone && <p>Phone: {address.phone}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressesTab;
