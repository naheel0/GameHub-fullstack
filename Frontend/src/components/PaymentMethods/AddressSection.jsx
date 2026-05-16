import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const REQUIRED = ["fullName", "addressLine1", "city", "state", "zipCode", "country"];

const validate = (form) => {
  const errors = {};
  REQUIRED.forEach((f) => {
    if (!form[f]?.trim()) errors[f] = "This field is required";
  });
  if (form.zipCode && !/^[1-9][0-9]{5}$/.test(form.zipCode.trim()))
    errors.zipCode = "Enter a valid 6-digit ZIP code";
  if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "")))
    errors.phone = "Enter a valid 10-digit phone number";
  return errors;
};

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset errors when form opens/closes
  useEffect(() => {
    if (!showAddressForm) { setErrors({}); setTouched({}); }
  }, [showAddressForm]);

  useEffect(() => {
    if (userAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [userAddresses, selectedAddress, setSelectedAddress]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(addressForm));
  };

  const handleChange = (field, value) => {
    handleAddressInputChange(field, value);
    if (touched[field]) {
      setErrors(validate({ ...addressForm, [field]: value }));
    }
  };

  const handleSave = () => {
    // Mark all fields touched and validate before saving
    const allTouched = Object.fromEntries(
      [...REQUIRED, "phone"].map((f) => [f, true])
    );
    setTouched(allTouched);
    const errs = validate(addressForm);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    handleSaveAddress();
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
      errors[field] && touched[field] ? "border-red-500" : "border-gray-600"
    }`;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaMapMarkerAlt className="text-red-500 mr-3" />
          Shipping Address
        </h2>
        <button
          onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
        >
          <FaPlus className="h-4 w-4" />
          <span>Add New</span>
        </button>
      </div>

      {showAddressForm ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required error={touched.fullName && errors.fullName} className="md:col-span-2">
              <input type="text" value={addressForm.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                placeholder="Enter full name"
                className={inputClass("fullName")} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Address Line 1" required error={touched.addressLine1 && errors.addressLine1}>
                <input type="text" value={addressForm.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  onBlur={() => handleBlur("addressLine1")}
                  placeholder="Street address, P.O. box, etc."
                  className={inputClass("addressLine1")} />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Address Line 2">
                <input type="text" value={addressForm.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  placeholder="Apartment, suite, building, etc."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500" />
              </Field>
            </div>

            <Field label="City" required error={touched.city && errors.city}>
              <input type="text" value={addressForm.city}
                onChange={(e) => handleChange("city", e.target.value)}
                onBlur={() => handleBlur("city")}
                placeholder="City" className={inputClass("city")} />
            </Field>

            <Field label="State" required error={touched.state && errors.state}>
              <input type="text" value={addressForm.state}
                onChange={(e) => handleChange("state", e.target.value)}
                onBlur={() => handleBlur("state")}
                placeholder="State" className={inputClass("state")} />
            </Field>

            <Field label="ZIP Code" required error={touched.zipCode && errors.zipCode}>
              <input type="text" value={addressForm.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
                onBlur={() => handleBlur("zipCode")}
                placeholder="6-digit ZIP code" className={inputClass("zipCode")} />
            </Field>

            <Field label="Country" required error={touched.country && errors.country}>
              <input type="text" value={addressForm.country}
                onChange={(e) => handleChange("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                placeholder="Country" className={inputClass("country")} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Phone Number" error={touched.phone && errors.phone}>
                <input type="tel" value={addressForm.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="10-digit phone number"
                  className={inputClass("phone")} />
              </Field>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={addressForm.isDefault}
                  onChange={(e) => handleAddressInputChange("isDefault", e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-800" />
                <span className="text-sm text-gray-300">Set as default address</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { resetAddressForm(); setShowAddressForm(false); }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300">
              Cancel
            </button>
            <button onClick={handleSave}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300">
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
              <div key={address.id}
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
                      {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </p>
                    <p className="text-gray-400 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                    <p className="text-gray-400 text-sm">{address.country}</p>
                    {address.phone && <p className="text-gray-400 text-sm">{address.phone}</p>}
                    {address.isDefault && <span className="text-xs text-green-400 font-medium">Default</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}
                      className="text-blue-400 hover:text-blue-300 transition duration-300" title="Edit address">
                      <FaEdit />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                      className="text-red-400 hover:text-red-300 transition duration-300" title="Delete address">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {!address.isDefault && (
                  <button onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(address.id); }}
                    className="mt-3 text-sm text-red-400 hover:text-red-300">
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
