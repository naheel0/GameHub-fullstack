import React, { createContext, useState, useContext, useEffect } from 'react';
import { BaseUrl, getStoredAuth, normalizeUser, setStoredAuth } from '../Services/api';
const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = BaseUrl;

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const persistedAuth = getStoredAuth();
        if (!persistedAuth?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          setUser(null);
          setStoredAuth(null);
          setLoading(false);
          return;
        }

        const refreshPayload = await refreshResponse.json().catch(() => null);
        const refreshedUser = normalizeUser(refreshPayload?.data, refreshPayload?.data?.accessToken);
        if (refreshedUser?.accessToken) {
          setUser(refreshedUser);
          setStoredAuth({ user: refreshedUser });
        } else {
          setUser(null);
          setStoredAuth(null);
        }
      } catch (error) {
        console.error('Auth refresh bootstrap error:', error);
        setUser(null);
        setStoredAuth(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [API_BASE]);

  const authFetchWithLogout = async (url, options = {}) => {
    const { __skipRefresh, ...requestOptions } = options;

    const buildHeaders = (headersInput = {}) => {
      try {
        if (headersInput && typeof headersInput.entries === 'function') {
          return Object.fromEntries(headersInput.entries());
        }
      } catch {
        // fall through
      }
      return { ...headersInput };
    };

    const performRefresh = async () => {
      const persistedAuth = getStoredAuth();
      if (!persistedAuth?.user && !user?.accessToken) {
        return null;
      }

      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          return null;
        }

        const refreshPayload = await refreshResponse.json().catch(() => null);
        const refreshedUser = normalizeUser(refreshPayload?.data, refreshPayload?.data?.accessToken);
        if (!refreshedUser) {
          return null;
        }

        setUser(refreshedUser);
        setStoredAuth({ user: refreshedUser });
        return refreshedUser;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    };

    try {
      const headers = buildHeaders(requestOptions.headers);
      const currentToken = user?.accessToken || getStoredAuth()?.user?.accessToken || '';

      if (!headers.Authorization && currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }

      const fetchOptions = {
        ...requestOptions,
        headers,
        credentials: requestOptions.credentials || 'include',
      };

      const response = await fetch(url, fetchOptions);
      if (response.status !== 401 || __skipRefresh) {
        if (response.status === 401) {
          setUser(null);
          setStoredAuth(null);
        }
        return response;
      }

      const refreshedUser = await performRefresh();
      if (!refreshedUser) {
        setUser(null);
        setStoredAuth(null);
        return response;
      }

      const retryHeaders = buildHeaders(requestOptions.headers);
      if (refreshedUser.accessToken) {
        retryHeaders.Authorization = `Bearer ${refreshedUser.accessToken}`;
      } else if (currentToken) {
        retryHeaders.Authorization = `Bearer ${currentToken}`;
      }

      return fetch(url, {
        ...requestOptions,
        headers: retryHeaders,
        credentials: requestOptions.credentials || 'include',
        __skipRefresh: true,
      });
    } catch (err) {
      console.error('authFetch error:', err);
      throw err;
    }
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
      // Do not persist access tokens in localStorage — prefer httpOnly cookies set by server
      setStoredAuth({ user: userData });
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

      const responseText = await createResponse.text();
      let payload = {};
      if (responseText) {
        try {
          payload = JSON.parse(responseText);
        } catch {
          payload = { message: responseText };
        }
      }

      if (!createResponse.ok || !payload?.success) {
        const errors = payload?.errors || payload?.Errors || payload?.extensions?.errors;
        if (errors && typeof errors === 'object') {
            const canonicalMap = {
              firstname: 'firstName',
              lastname: 'lastName',
              email: 'email',
              phone: 'phone',
              password: 'password',
              confirmpassword: 'confirmPassword',
              role: 'role',
              status: 'status'
            };

            const mapped = {};
            Object.keys(errors).forEach((rawKey) => {
              try {
                let key = rawKey.split('.').pop();
                key = key.replace(/\[\d+\]/g, '');
                const lower = key.toLowerCase();
                const target = canonicalMap[lower] || key;
                const values = Array.isArray(errors[rawKey]) ? errors[rawKey] : [errors[rawKey]];
                mapped[target] = (mapped[target] || []).concat(values.map(v => typeof v === 'string' ? v : String(v)));
              } catch {
                mapped[rawKey] = mapped[rawKey] || [];
              }
            });

            return { success: false, error: payload?.detail || payload?.message || 'Please fix the highlighted fields and try again.', fieldErrors: mapped };
          }

        return { success: false, error: payload?.message || payload?.detail || 'Signup failed. Please try again.' };
      }

      const createdUser = normalizeUser(payload.data, payload.data?.accessToken);
      setUser(createdUser);
      // Do not persist access tokens in localStorage — prefer httpOnly cookies set by server
      setStoredAuth({ user: createdUser });

      return { success: true, user: createdUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).catch((error) => console.error('Logout error:', error));
    setUser(null);
    setStoredAuth(null);
  };

  const updateUser = async (userUpdates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = {
        ...user,
        ...userUpdates,
      };

      setUser(updatedUser);
      setStoredAuth({ user: updatedUser });
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
      setStoredAuth({ user: updatedUser });
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
    authFetch: authFetchWithLogout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};