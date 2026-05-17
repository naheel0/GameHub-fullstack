import React, { createContext, useState, useContext, useEffect } from 'react';
import { BaseUrl, buildAuthHeaders, getStoredAuth, normalizeUser, setStoredAuth } from '../Services/api';
const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    return {
      user: null,
      login: async () => ({ success: false, error: 'Auth not available' }),
      signup: async () => ({ success: false, error: 'Auth not available' }),
      logout: () => {},
      updateUser: async () => ({ success: false, error: 'Auth not available' }),
      loading: false
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = BaseUrl;

  useEffect(() => {
    const savedAuth = getStoredAuth();
    if (savedAuth?.user) {
      if (savedAuth.accessToken && !savedAuth.user.accessToken) {
        savedAuth.user.accessToken = savedAuth.accessToken;
      }
      setUser(savedAuth.user);
    }
    setLoading(false);
  }, []);

  // Call this to silently get a new access token using the HttpOnly refresh token cookie
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends the refreshToken cookie automatically
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const newToken = payload.data?.accessToken;
      if (!newToken) return null;
      // Update stored user with new token
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, accessToken: newToken };
        setStoredAuth({ user: updated, accessToken: newToken });
        return updated;
      });
      return newToken;
    } catch {
      return null;
    }
  };

  // Improved authFetch: auto-retry once with refreshed token on 401 and logout if refresh fails
  const authFetchWithLogout = async (url, options = {}) => {
    let response = await fetch(url, { ...options, credentials: 'include' });
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        });
      } else {
        // Refresh failed -> force logout so UI stops making authorized requests
        console.warn('Token refresh failed; logging out user');
        setUser(null);
        setStoredAuth(null);
        return response;
      }
    }
    return response;
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        return { success: false, error: payload?.message || 'Invalid email or password' };
      }

      const userData = normalizeUser(payload.data, payload.data?.accessToken);
      setUser(userData);
      setStoredAuth({ user: userData, accessToken: userData.accessToken });
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (userData) => {
    try {
      const createResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || '',
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword || userData.password,
        }),
      });

      const payload = await createResponse.json();
      if (!createResponse.ok || !payload?.success) {
        return { success: false, error: payload?.message || 'Signup failed. Please try again.' };
      }

      const createdUser = normalizeUser(payload.data, payload.data?.accessToken);
      setUser(createdUser);
      setStoredAuth({ user: createdUser, accessToken: createdUser.accessToken });

      return { success: true, user: createdUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    const token = user?.accessToken;
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: 'include',
      }).catch((error) => console.error('Logout error:', error));
    }
    setUser(null);
    setStoredAuth(null);
  };

  const updateUser = async (userUpdates) => {
    try {
      // Merge updates with current user state instead of replacing
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = {
        ...user,
        ...userUpdates,
      };

      setUser(updatedUser);
      setStoredAuth({ user: updatedUser, accessToken: updatedUser.accessToken });
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const updateUserPartial = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setStoredAuth({ user: updatedUser, accessToken: updatedUser.accessToken });
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    updateUserPartial,
    refreshAccessToken,
    authFetch: authFetchWithLogout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};