import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { BaseUrl, normalizeGame } from "../../Services/api";
import { toast } from "react-toastify";
import AddressSection from "../PaymentMethods/AddressSection";
import OrderSummary from "../PaymentMethods/OrderSummary";
import PaymentActionSection from './PaymentActionSection';
import SecurityFeatures from './SecurityFeatures';
import {
  FaArrowLeft,
} from "react-icons/fa";

const PaymentPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);

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

const navigate = useNavigate();
  const location = useLocation();
  const { getCartSummary, checkout, cart } = useCart();
  const { user, loading: authLoading, authFetch } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const API_BASE = BaseUrl;
  const userAddresses = addresses;

  const order = paymentOrder;

  const getBuyNowIntent = useCallback(() => {
    try {
      const raw = localStorage.getItem('buyNowIntent');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const buyNowIntent = useMemo(() => getBuyNowIntent(), [getBuyNowIntent]);

  const buyNowSummary = useMemo(() => {
    if (!buyNowIntent?.game) return null;
    const subtotal = buyNowIntent.game.price * buyNowIntent.quantity;
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = subtotal + tax;
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      totalItems: buyNowIntent.quantity
    };
  }, [buyNowIntent]);

  const summary = order?.summary || buyNowSummary || getCartSummary();


   const clearStaleOrder = useCallback(() => {
    try { localStorage.removeItem('pendingRazorpayOrder'); } catch { /* ignore */ }
    try { localStorage.removeItem('pendingPurchase'); } catch { /* ignore */ }
    setPaymentOrder(null);
  }, []);

  const clearBuyNowIntent = useCallback(() => {
    try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
  }, []);

  const savePendingOrderDraft = useCallback((draftOrder) => {
    if (!draftOrder) return;

    try {
      localStorage.setItem('pendingRazorpayOrder', JSON.stringify(draftOrder));
    } catch (error) {
      console.debug('Failed to persist pendingRazorpayOrder', error);
    }
  }, []);

  const redirectToLogin = useCallback(() => {
    navigate("/login", {
      replace: true,
      state: { from: location.pathname },
    });
  }, [location.pathname, navigate]);

  const requireAuthenticatedUser = useCallback(() => {
    if (authLoading) {
      return false;
    }

    if (!user) {
      redirectToLogin();
      return false;
    }

    return true;
  }, [authLoading, redirectToLogin, user]);

  useEffect(() => {
    const storedOrder = (() => {
      try {
        const raw = localStorage.getItem('pendingRazorpayOrder');
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.debug('Failed to read pendingRazorpayOrder', error);
        return null;
      }
    })();

    if (location.state?.order) {
      setPaymentOrder(location.state.order);
      savePendingOrderDraft(location.state.order);
      return;
    }

    if (storedOrder) {
      const verifyStaleOrder = async () => {
        try {
          const verifyRes = await authFetch(`${API_BASE}/orders`);
          if (verifyRes.ok) {
            const orders = await verifyRes.json();
            const stillPending = orders.some(
              (o) => o.purchaseId === storedOrder.purchaseId && o.status === "Pending"
            );
            if (!stillPending) {
              clearStaleOrder();
              setPaymentOrder(null);
              return;
            }
          }
        } catch {
          clearStaleOrder();
          setPaymentOrder(null);
          return;
        }
        setPaymentOrder(storedOrder);
      };

      verifyStaleOrder();
      return;
    }

    setPaymentOrder(null);
  }, [location.state?.order, savePendingOrderDraft, clearStaleOrder, authFetch, API_BASE]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      redirectToLogin();
      return;
    }

    if (!order && cart.length === 0 && !buyNowIntent) {
      navigate("/cart", { replace: true });
    }

    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [authLoading, buyNowIntent, cart.length, navigate, order, redirectToLogin, selectedAddress, user, addresses]);

  const refreshAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/addresses`);

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      const mapped = (data || []).map((addr) => ({
        ...addr,
        id: addr.addressId || addr.id,
      }));
      setAddresses(mapped);
    } catch (error) {
      console.error("Error loading addresses:", error);
      setAddresses([]);
    }
  }, [API_BASE, user, authFetch]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  // saved-cards removed

  const handleAddressInputChange = (field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
  }, []);

  const handleSaveAddress = async () => {
    try {
      if (!requireAuthenticatedUser()) {
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
        const response = await authFetch(
          `${API_BASE}/addresses/${editingAddress}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          const message = await response.text().catch(() => "Failed to update address");
          toast.error(message || "Could not update the address. Please try again.");
          return;
        }
      } else {
        const response = await authFetch(`${API_BASE}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const message = await response.text().catch(() => "Failed to add address");
          toast.error(message || "Could not save the address. Please try again.");
          return;
        }

        const created = await response.json();
        createdId = created.addressId || created.id;
      }

      await refreshAddresses();
      toast.success(
        `Address ${editingAddress ? "updated" : "saved"} successfully!`,
      );
      setShowAddressForm(false);
      resetAddressForm();
      if (createdId) {
        setSelectedAddress(createdId);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      const message =
        error?.message || "Failed to save address. Please try again.";
      toast.error(message);
    }
  };

  const handleEditAddress = (address) => {
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
      toast.info("Keep at least one saved address before deleting it.");
      return;
    }

    try {
      if (!requireAuthenticatedUser()) {
        return;
      }

      const response = await authFetch(`${API_BASE}/addresses/${addressId}`, {
        method: "DELETE",
        headers: {

        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      await refreshAddresses();

      if (selectedAddress === addressId) {
        const fallback = userAddresses.filter((addr) => addr.id !== addressId);
        setSelectedAddress(fallback[0]?.id || null);
      }

      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };

const handleSetDefaultAddress = async (addressId) => {
    try {
      if (!requireAuthenticatedUser()) {
        return;
      }

      const response = await authFetch(
        `${API_BASE}/addresses/${addressId}/default`,
        {
          method: "PUT",
          headers: {
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update default address");
      }

      await refreshAddresses();
      toast.success("Default address updated!");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Failed to update default address.");
    }
  };

  const handleBuyNowCheckout = async (buyNowIntent, addressId) => {
    const gameResponse = await authFetch(`${API_BASE}/games/${buyNowIntent.gameId}`);
    if (!gameResponse.ok) {
      throw new Error('Game is no longer available.');
    }
    const gameData = await gameResponse.json();
    const normalized = normalizeGame(gameData);
    if (!normalized || !normalized.inStock) {
      throw new Error('Game is currently out of stock.');
    }

    const response = await authFetch(`${API_BASE}/orders/buy-now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: buyNowIntent.gameId,
        quantity: buyNowIntent.quantity,
        addressId: addressId
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || 'Failed to create buy now order');
    }

    const orderData = await response.json();
    return {
      purchaseId: orderData.purchaseId,
      items: orderData.items || [],
      summary: {
        subtotal: orderData.subTotal,
        tax: orderData.tax,
        total: orderData.total,
        totalItems: orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 1
      }
    };
  };

  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);

    try {
      if (!requireAuthenticatedUser()) {
        return;
      }

      const buyNowIntent = getBuyNowIntent();
      let paymentOrder = order;

      // Handle buy-now flow
      if (buyNowIntent && !paymentOrder?.purchaseId) {
        try {
          const buyNowResult = await handleBuyNowCheckout(buyNowIntent, selectedAddress);
          paymentOrder = buyNowResult;
          setPaymentOrder(paymentOrder);
          savePendingOrderDraft(paymentOrder);
          try {
            const pid = buyNowResult.purchaseId;
            if (pid) localStorage.setItem('pendingPurchase', String(pid));
          } catch (e) {
            console.debug('Failed to store pending purchase for buy-now flow', e);
          }
        } catch (error) {
          toast.error(error.message || 'Could not create buy now order.');
          return;
        }
      }

      // If we have a stored order, verify it's still valid on the server before using it
      if (paymentOrder?.purchaseId) {
        try {
          const verifyRes = await authFetch(`${API_BASE}/orders`);
          if (verifyRes.ok) {
            const orders = await verifyRes.json();
            const stillPending = orders.some(
              (o) => o.purchaseId === paymentOrder.purchaseId && o.status === "Pending"
            );
            if (!stillPending) {
              clearStaleOrder();
              paymentOrder = null;
            }
          }
        } catch {
          // If verify fails, clear and re-checkout to be safe
          clearStaleOrder();
          paymentOrder = null;
        }
      }

      if (!paymentOrder?.purchaseId) {
        const checkoutResult = await checkout("razorpay", selectedAddress);

        if (!checkoutResult.success) {
          toast.error(
            checkoutResult.error || "Could not create the Razorpay order.",
          );
          return;
        }

        paymentOrder = checkoutResult.order;
        setPaymentOrder(paymentOrder);
        savePendingOrderDraft(paymentOrder);
      }

      const purchaseId = paymentOrder?.purchaseId;
      if (!purchaseId) {
        toast.error("A saved purchase is required before redirecting to Razorpay.");
        return;
      }

      const response = await authFetch(
        `${API_BASE}/payments/create-link/${purchaseId}`,
        {
          method: "POST",
          headers: {},
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        // Stale order — clear it so the next attempt creates a fresh one
        if (response.status === 404) {
          clearStaleOrder();
        }
        throw new Error(text || "Failed to create Razorpay payment link");
      }

      const link = await response.json();
      const shortUrl = link.shortUrl || link.short_url;

      if (!shortUrl) {
        throw new Error(
          "Razorpay payment link response was missing the redirect URL",
        );
      }

      window.location.href = shortUrl;
    } catch (error) {
      console.error("Razorpay redirect error:", error);
      toast.error(error?.message || "Could not open Razorpay. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToCart = () => {
    // Check localStorage directly for the most current state
    const hasBuyNowIntent = (() => {
      try {
        const raw = localStorage.getItem('buyNowIntent');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    if (hasBuyNowIntent || location.state?.fromProduct) {
      // Buy Now: clean up before navigating away to prevent cart restore issues
      try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
      try { localStorage.removeItem('pendingPurchase'); } catch { /* ignore */ }
      navigate("/products");
    } else {
      navigate("/cart");
    }
  };

  const getOrderItems = useCallback(() => {
    if (order) {
      return order.items;
    }
    if (buyNowIntent?.game) {
      return [{
        name: buyNowIntent.game.name,
        price: buyNowIntent.game.price,
        quantity: buyNowIntent.quantity,
        image: buyNowIntent.game.image
      }];
    }
    return cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0],
    }));
  }, [order, buyNowIntent, cart]);

  const orderItems = getOrderItems();
  const isBuyNowFlow = !!buyNowIntent;
  const selectedAddressDataForSummary = userAddresses.find(
    (addr) => addr.id === selectedAddress,
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
              {isBuyNowFlow ? "Back to Products" : "Back to Cart"}
            </button>
            <h1 className="text-4xl font-bold text-white">
              Complete Your Purchase
            </h1>
            <p className="text-lg text-gray-300 mt-2">
              Review your order and continue to payment
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Order Total</p>
            <p className="text-3xl font-bold text-red-500">
              ₹{summary?.total || "0.00"}
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
            />

            <PaymentActionSection
              isProcessing={isProcessing}
              onPay={handleRazorpayCheckout}
              disabled={isProcessing || !selectedAddress}
            />

            <SecurityFeatures />
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
