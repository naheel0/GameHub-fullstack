import React, { useEffect } from "react";
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    {children}
  </div>
);

const AddressSection = ({
  userAddresses = [],
  selectedAddress,
  setSelectedAddress,
  showAddressForm,
  setShowAddressForm,
  addressForm,
  handleAddressInputChange,
  handleSaveAddress,
  handleEditAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
  editingAddress,
  resetAddressForm,
}) => {
  useEffect(() => {
    if (userAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [userAddresses, selectedAddress, setSelectedAddress]);

  const handleChange = (field, value) => {
    handleAddressInputChange(field, value);
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent";

  const getInputClass = (fieldName) => inputClass;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaMapMarkerAlt className="text-red-500 mr-3" />
          Shipping Address
        </h2>
        <button
          onClick={() => {
            resetAddressForm();
            setShowAddressForm(true);
          }}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
        >
          <FaPlus className="h-4 w-4" />
          <span>Add New</span>
        </button>
      </div>

      {showAddressForm ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" className="md:col-span-2">
              <input
                type="text"
                value={addressForm.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                 placeholder="Enter full name"
                 className={getInputClass("fullName")}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Address Line 1">
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                 placeholder="Street address, P.O. box, etc."
                 className={getInputClass("addressLine1")}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Address Line 2">
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  placeholder="Apartment, suite, building, etc."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                />
              </Field>
            </div>

              <Field label="City">
              <input
                type="text"
                value={addressForm.city}
                onChange={(e) => handleChange("city", e.target.value)}
                 placeholder="City"
                 className={getInputClass("city")}
              />
            </Field>

              <Field label="State">
              <input
                type="text"
                value={addressForm.state}
                onChange={(e) => handleChange("state", e.target.value)}
                 placeholder="State"
                 className={getInputClass("state")}
              />
            </Field>

              <Field label="ZIP Code">
              <input
                type="text"
                value={addressForm.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
                 placeholder="ZIP / postal code"
                 className={getInputClass("zipCode")}
              />
            </Field>

              <Field label="Country">
              <input
                type="text"
                value={addressForm.country}
                onChange={(e) => handleChange("country", e.target.value)}
                 placeholder="Country"
                 className={getInputClass("country")}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Phone Number">
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                 placeholder="+91 98765 43210"
                 className={getInputClass("phone")}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => handleAddressInputChange("isDefault", e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-800"
                />
                <span className="text-sm text-gray-300">Set as default address</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                resetAddressForm();
                setShowAddressForm(false);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAddress}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              {editingAddress ? "Update Address" : "Save Address"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userAddresses.length === 0 ? (
            <div className="text-gray-400 text-center py-6">No saved addresses yet.</div>
          ) : (
            userAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 border rounded-lg transition duration-300 cursor-pointer ${
                  selectedAddress === address.id
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                }`}
                onClick={() => setSelectedAddress(address.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">{address.fullName}</h3>
                    <p className="text-gray-400 text-sm">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-400 text-sm">{address.country}</p>
                    {address.phone && <p className="text-gray-400 text-sm">{address.phone}</p>}
                    {address.isDefault && <span className="text-xs text-green-400 font-medium">Default</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAddress(address);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition duration-300"
                      title="Edit address"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition duration-300"
                      title="Delete address"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {!address.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefaultAddress(address.id);
                    }}
                    className="mt-3 text-sm text-red-400 hover:text-red-300"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSection;
