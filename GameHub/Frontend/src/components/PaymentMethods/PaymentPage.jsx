import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { BaseUrl, buildAuthHeaders } from "../../Services/api";
import { toast } from "react-toastify";
import AddressSection from '../PaymentMethods/AddressSection'; // New Component
import PaymentFormSection from "../PaymentMethods/PaymentFormSection"; // New Component
import OrderSummary from "../PaymentMethods/OrderSummary"; // New Component
import {
  FaLock, 
  FaShieldAlt, 
  FaCheckCircle, 
   FaArrowLeft 
} from "react-icons/fa";

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "india",
    phone: "",
    isDefault: false,
  });
  const [addressSubmitError, setAddressSubmitError] = useState("");
  const [addressFieldErrors, setAddressFieldErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { getCartSummary, checkout, cart } = useCart();
  const { user, authFetch } = useAuth();

  const order = location.state?.order;
  const summary = order?.summary || getCartSummary();
  const [addresses, setAddresses] = useState([]);
  const userAddresses = useMemo(() => addresses, [addresses]);
  const API_BASE = BaseUrl;
  const token = user?.accessToken;

  useEffect(() => {
    if (!user) {
      toast.warning("Please log in to proceed with payment.");
      navigate("/login");
      return;
    }

    if (!order && cart.length === 0) {
      toast.warning("Your cart is empty.");
      navigate("/cart");
    }

    if (userAddresses.length > 0 && !selectedAddress) {
      const defaultAddress =
        userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [user, order, cart, navigate, userAddresses, selectedAddress]);

  const refreshAddresses = useCallback(async () => {
    if (!user || !token) {
      setAddresses([]);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/addresses`, {
        headers: {
          ...buildAuthHeaders(token),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      const mapped = (data || []).map((addr) => ({
        ...addr,
        id: addr.addressId || addr.id,
      }));
      setAddresses(mapped);
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
    }
  }, [API_BASE, token, user, authFetch]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const fetchSavedCards = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await authFetch(`${API_BASE}/carddetails`, {
        headers: { ...buildAuthHeaders(token) },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCards(data || []);
        const def = (data || []).find((c) => c.isDefault) || data?.[0];
        if (def) setSelectedCardId(def.id);
      }
    } catch { /* ignore */ }
  }, [API_BASE, token, user, authFetch]);

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards]);


  const handleAddressInputChange = (field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setAddressSubmitError("");
    setAddressFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetAddressForm = useCallback(() => {
    setAddressForm({
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "india",
      phone: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setAddressSubmitError("");
    setAddressFieldErrors({});
  }, []);

  const mapProblemDetailsErrors = (errors) => {
    const canonicalMap = {
      fullname: "fullName",
      addressline1: "addressLine1",
      addressline2: "addressLine2",
      city: "city",
      state: "state",
      zipcode: "zipCode",
      country: "country",
      phone: "phone",
      isdefault: "isDefault",
    };

    const mapped = {};
    Object.entries(errors || {}).forEach(([rawKey, rawValue]) => {
      const keyPart = String(rawKey).split(".").pop().replace(/\[\d+\]/g, "");
      const target = canonicalMap[keyPart.toLowerCase()] || keyPart;
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      mapped[target] = (mapped[target] || []).concat(values.map((value) => String(value)));
    });
    return mapped;
  };

  // validateAddress removed — unused helper

  const handleSaveAddress = async () => {
    try {
      setAddressSubmitError("");
      setAddressFieldErrors({});

      if (!user || !token) {
        toast.warning('Please log in to manage addresses.');
        return;
      }

      const payload = {
        fullName: addressForm.fullName,
        addressLine1: addressForm.addressLine1,
        addressLine2: addressForm.addressLine2,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.zipCode,
        country: addressForm.country,
        phone: addressForm.phone,
        isDefault: addressForm.isDefault,
      };

      let createdId = null;

      if (editingAddress) {
        const response = await authFetch(`${API_BASE}/addresses/${editingAddress}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(token),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          if (payload?.errors) {
            setAddressFieldErrors(mapProblemDetailsErrors(payload.errors));
          }
          const message = payload?.detail || payload?.message || 'Failed to update address';
          setAddressSubmitError(message);
          toast.error(message);
          return;
        }
      } else {
        const response = await authFetch(`${API_BASE}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(token),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          if (payload?.errors) {
            setAddressFieldErrors(mapProblemDetailsErrors(payload.errors));
          }
          const message = payload?.detail || payload?.message || 'Failed to add address';
          setAddressSubmitError(message);
          toast.error(message);
          return;
        }

        const created = await response.json();
        createdId = created.addressId || created.id;
      }

      await refreshAddresses();
      toast.success(`Address ${editingAddress ? "updated" : "saved"} successfully!`);
      setShowAddressForm(false);
      resetAddressForm();
      if (createdId) {
        setSelectedAddress(createdId);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      const message = error?.message || "Failed to save address. Please try again.";
      setAddressSubmitError(message);
      toast.error(message);
    }
  };

  const handleEditAddress = (address) => {
    setAddressSubmitError("");
    setAddressFieldErrors({});
    setAddressForm({
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setEditingAddress(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (userAddresses.length <= 1) {
      toast.error("You must have at least one address");
      return;
    }

    try {
      if (!user || !token) {
        toast.warning('Please log in to manage addresses.');
        return;
      }

      const response = await authFetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          ...buildAuthHeaders(token),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      await refreshAddresses();

      if (selectedAddress === addressId) {
        const fallback = userAddresses.filter((addr) => addr.id !== addressId);
        setSelectedAddress(fallback[0]?.id || null);
      }

      toast.success('Address deleted successfully!');
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      if (!user || !token) {
        toast.warning('Please log in to manage addresses.');
        return;
      }

      const response = await authFetch(`${API_BASE}/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          ...buildAuthHeaders(token),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update default address');
      }

      await refreshAddresses();
      toast.success('Default address updated!');
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to update default address.");
    }
  };



  const handleCardInputChange = (field, value) => {
    let formattedValue = value;

    if (field === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19)
        formattedValue = formattedValue.slice(0, 19);
    } else if (field === "expiry") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
      if (formattedValue.length > 5)
        formattedValue = formattedValue.slice(0, 5);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const validateCardDetails = () => {
    if (cardDetails.number.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return false;
    }

    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return false;
    }

    if (cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      const [month, year] = cardDetails.expiry.split("/").map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (month < 1 || month > 12) {
        toast.error("Please enter a valid month (01-12)");
        return false;
      }

      if (
        year < currentYear ||
        (year === currentYear && month < currentMonth)
      ) {
        toast.error("Card has expired");
        return false;
      }
    }

    if (cardDetails.cvv.length !== 3) {
      toast.error("Please enter a valid 3-digit CVV");
      return false;
    }
    if (cardDetails.name.trim().length < 2) {
      toast.error("Please enter cardholder name");
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return false;
    }

    if (selectedMethod === "card" && !validateCardDetails()) {
      return false;
    }

    return true;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.warning("Please log in to complete payment.");
      navigate("/login");
      return;
    }

    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      const selectedAddressData = userAddresses.find(
        (addr) => addr.id === selectedAddress
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      let result;
      if (order) {
        result = { success: true, order };
      } else {
        result = await checkout(selectedMethod, selectedAddress || selectedAddressData?.id || selectedAddressData?.addressId);
      }

      if (result.success) {
        // Save card if requested
        if (selectedMethod === "card" && saveCard) {
          try {
            await authFetch(`${API_BASE}/carddetails`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...buildAuthHeaders(token) },
              body: JSON.stringify({
                cardNumber: cardDetails.number.replace(/\s/g, ""),
                expiryDate: cardDetails.expiry,
                cvv: cardDetails.cvv,
                cardholderName: cardDetails.name,
                isDefault: savedCards.length === 0,
              }),
            });
          } catch { /* non-critical */ }
        }

        toast.success("Payment processed successfully!");

        navigate("/order-confirmation", {
          state: {
            order: result.order,
            paymentMethod: selectedMethod,
            shippingAddress: selectedAddressData,
          },
        });
      } else {
        toast.error(result.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      let paymentOrder = order;

      if (!paymentOrder?.purchaseId) {
        const checkoutResult = await checkout("razorpay", selectedAddress);

        if (!checkoutResult.success) {
          toast.error(checkoutResult.error || "Failed to create Razorpay order.");
          return;
        }

        paymentOrder = checkoutResult.order;
      }

      const purchaseId = paymentOrder?.purchaseId;
      if (!purchaseId) {
        toast.error("Razorpay redirect requires a persisted purchase.");
        return;
      }

      const response = await authFetch(`${API_BASE}/payments/create-link/${purchaseId}`, {
        method: "POST",
        headers: { ...buildAuthHeaders(token) },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Failed to create Razorpay payment link");
      }

      const link = await response.json();
      const shortUrl = link.shortUrl || link.short_url;

      if (!shortUrl) {
        throw new Error("Razorpay payment link response was missing the redirect URL");
      }

      toast.info("Redirecting to Razorpay...");
      window.location.href = shortUrl;
    } catch (error) {
      console.error("Razorpay redirect error:", error);
      toast.error(error?.message || "Failed to redirect to Razorpay");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  const getOrderItems = () => {
    if (order) {
      return order.items;
    }
    return cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0],
    }));
  };

  const orderItems = getOrderItems();
  const selectedAddressDataForSummary = userAddresses.find(
    (addr) => addr.id === selectedAddress
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={handleBackToCart}
              className="flex items-center text-gray-400 hover:text-white transition duration-300 mb-2"
            >
              <FaArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </button>
            <h1 className="text-4xl font-bold text-white">
              Complete Your Purchase
            </h1>
            <p className="text-lg text-gray-300 mt-2">
              Choose your preferred payment method
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Order Total</p>
            <p className="text-3xl font-bold text-red-500">
              ${summary?.total || "0.00"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <AddressSection
              userAddresses={userAddresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              showAddressForm={showAddressForm}
              setShowAddressForm={setShowAddressForm}
              addressForm={addressForm}
              handleAddressInputChange={handleAddressInputChange}
              handleSaveAddress={handleSaveAddress}
              handleEditAddress={handleEditAddress}
              handleDeleteAddress={handleDeleteAddress}
              handleSetDefaultAddress={handleSetDefaultAddress}
              editingAddress={editingAddress}
              resetAddressForm={resetAddressForm}
              submitError={addressSubmitError}
              serverErrors={addressFieldErrors}
            />

            {/* Payment Methods Section */}
            <PaymentFormSection
              selectedMethod={selectedMethod}
              setSelectedMethod={setSelectedMethod}
              cardDetails={cardDetails}
              handleCardInputChange={handleCardInputChange}
              saveCard={saveCard}
              setSaveCard={setSaveCard}
              handlePaymentSubmit={handlePaymentSubmit}
              isProcessing={isProcessing}
              summary={summary}
              selectedAddress={selectedAddress}
              savedCards={savedCards}
              selectedCardId={selectedCardId}
              onSelectSavedCard={(card) => {
                setSelectedCardId(card.id);
                setCardDetails({
                  number: card.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 "),
                  expiry: card.expiryDate,
                  cvv: card.cvv,
                  name: card.cardholderName,
                });
              }}
              onDeleteSavedCard={async (cardId) => {
                try {
                  const res = await authFetch(`${API_BASE}/carddetails/${cardId}`, {
                    method: "DELETE",
                    headers: { ...buildAuthHeaders(token) },
                  });
                  if (res.ok) {
                    await fetchSavedCards();
                    if (selectedCardId === cardId) {
                      setSelectedCardId(null);
                      setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
                    }
                    toast.success("Card removed");
                  }
                } catch { toast.error("Failed to remove card"); }
              }}
              onRazorpayCheckout={handleRazorpayCheckout}
            />

            {/* Security Features (Can be a standalone component too, but keeping inline for simplicity) */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">
                Security Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Security features array from original component */}
                {[
                  {
                    icon: <FaLock className="text-xl" />,
                    title: "SSL Encrypted",
                    description: "All transactions are 256-bit SSL encrypted",
                  },
                  {
                    icon: <FaShieldAlt className="text-xl" />,
                    title: "PCI Compliant",
                    description: "We are PCI DSS Level 1 certified",
                  },
                  {
                    icon: <FaCheckCircle className="text-xl" />,
                    title: "3D Secure",
                    description:
                      "Additional security layer for card payments",
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
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              summary={summary}
              orderItems={orderItems}
              selectedAddress={selectedAddressDataForSummary}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;