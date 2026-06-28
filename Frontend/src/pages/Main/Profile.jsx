import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { BaseUrl, normalizeGame } from '../../Services/api';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileSidebar from '../../components/Profile/ProfileSidebar';
import ProfileOverview from '../../components/Profile/ProfileOverview';
import OrderHistoryTab from '../../components/Profile/OrderHistoryTab';
import WishlistTab from '../../components/Profile/WishlistTab';
import AddressesTab from '../../components/Profile/AddressesTab';

const Profile = () => {
  const { user, updateUser, authFetch } = useAuth();
  const { getCartSummary } = useCart();
  const { wishlist, getWishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  const API_BASE = BaseUrl;

  const formatRupees = useCallback((amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const fetchOrderCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await authFetch(`${API_BASE}/orders`);

      if (response.status === 401) {
        throw new Error(
          'Unauthorized: token expired or invalid. Please log out and log in again.'
        );
      }

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders = await response.json();
      setOrderCount((orders || []).length);
    } catch (error) {
      console.error('Error fetching order count:', error);
      setOrderCount(0);
    }
  }, [API_BASE, user, authFetch]);

  const fetchOrderHistory = useCallback(async () => {
    if (!user) return;

    try {
      setOrdersLoading(true);
      const response = await authFetch(`${API_BASE}/orders`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders = await response.json();
      setOrderCount((orders || []).length);

      if (!orders || orders.length === 0) {
        setOrderHistory([]);
        setOrdersLoading(false);
        return;
      }

      const gamesResponse = await fetch(`${API_BASE}/games?pageSize=100`);
      if (!gamesResponse.ok) {
        throw new Error('Failed to fetch games data');
      }

      const gamesPayload = await gamesResponse.json();
      const gameItems = gamesPayload?.data?.items || gamesPayload?.items || gamesPayload || [];
      const allGames = (gameItems || []).map(normalizeGame).filter(Boolean);

      const enhancedOrders = (orders || []).map((order) => {
        const enhancedItems = (order.items || []).map((item) => {
          const game = allGames.find((g) => g.id === item.gameId);

          return {
            ...item,
            name: item.gameName || item.name || game?.name || 'Unknown Game',
            price: item.price || game?.price || 0,
            quantity: item.quantity || 1,
            image: game?.images?.[0] || '/images/placeholder-game.jpg',
            genre: game?.genre || '',
            platform: game?.platform || '',
          };
        });

        return {
          id: order.orderId || order.id,
          date: order.orderDate || order.date,
          status: order.status,
          paymentMethod: order.paymentMethod,
          summary: {
            subtotal: Number(order.subTotal || order.summary?.subtotal || 0).toFixed(2),
            tax: Number(order.tax || order.summary?.tax || 0).toFixed(2),
            total: Number(order.total || order.summary?.total || 0).toFixed(2),
          },
          items: enhancedItems,
        };
      });

      setOrderHistory(enhancedOrders);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderHistory([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [API_BASE, user, authFetch]);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    try {
      setAddressesLoading(true);
      const response = await authFetch(`${API_BASE}/addresses`);

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
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [API_BASE, user, authFetch]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        ...formData,
      };

      const result = await updateUser(updatedUser);
      if (result.success) {
        setIsEditing(false);
        fetchOrderCount();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, formData, updateUser, fetchOrderCount]);

  const handleCancelEdit = useCallback(() => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  }, [user]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleEditToggle = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const handleViewWishlist = useCallback(() => {
    setActiveTab('wishlist');
  }, []);

  const handleViewOrders = useCallback(() => {
    setActiveTab('orders');
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      fetchOrderCount();
    }
  }, [user, fetchOrderCount]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrderHistory();
    }
  }, [activeTab, user, fetchOrderHistory]);

  useEffect(() => {
    if (activeTab === 'addresses' && user) {
      fetchAddresses();
    }
  }, [activeTab, user, fetchAddresses]);

  const cartSummary = getCartSummary();
  const wishlistCount = getWishlistCount();

  if (!user) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
            <p className="text-gray-400 mb-8">
              You need to be logged in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader
          user={user}
          isEditing={isEditing}
          onEditToggle={handleEditToggle}
          formatDate={formatDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ProfileSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              cartSummary={cartSummary}
              wishlistCount={wishlistCount}
              orderCount={orderCount}
            />
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <ProfileOverview
                user={user}
                isEditing={isEditing}
                formData={formData}
                onInputChange={handleInputChange}
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
                loading={loading}
                formatRupees={formatRupees}
                cartSummary={cartSummary}
                wishlistCount={wishlistCount}
                onViewWishlist={handleViewWishlist}
                onViewOrders={handleViewOrders}
              />
            )}

            {activeTab === 'orders' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Order History
                </h2>
                <OrderHistoryTab
                  orders={orderHistory}
                  loading={ordersLoading}
                  formatDate={formatDate}
                  formatRupees={formatRupees}
                />
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">My Wishlist</h2>
                <WishlistTab wishlist={wishlist} formatRupees={formatRupees} />
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Saved Addresses
                </h2>
                <AddressesTab addresses={addresses} loading={addressesLoading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
