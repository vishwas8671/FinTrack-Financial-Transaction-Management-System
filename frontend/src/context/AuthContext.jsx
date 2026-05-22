import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Backend API URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://YOUR-RENDER-BACKEND.onrender.com';

// Set axios base URL globally
axios.defaults.baseURL = API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Setup axios auth headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;

      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common[
        'Authorization'
      ];

      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user profile
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/profile');

        if (res.data.success) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error(
          'Failed to load user profile',
          err
        );

        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        '/api/auth/login',
        {
          email,
          password,
        }
      );

      if (res.data.success) {
        setToken(res.data.data.token);

        setUser({
          _id: res.data.data._id,
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
        });

        return { success: true };
      }
    } catch (err) {
      console.error(err);

      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Login failed, please check credentials',
      };
    }
  };

  // Register
  const register = async (
    name,
    email,
    password,
    role
  ) => {
    try {
      const res = await axios.post(
        '/api/auth/register',
        {
          name,
          email,
          password,
          role,
        }
      );

      if (res.data.success) {
        setToken(res.data.data.token);

        setUser({
          _id: res.data.data._id,
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
        });

        return { success: true };
      }
    } catch (err) {
      console.error(err);

      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Registration failed, email might already exist',
      };
    }
  };

  // Update Profile
  const updateProfile = async (
    name,
    email,
    password
  ) => {
    try {
      const res = await axios.put(
        '/api/auth/profile',
        {
          name,
          email,
          password,
        }
      );

      if (res.data.success) {
        if (res.data.data.token) {
          setToken(res.data.data.token);
        }

        setUser({
          _id: res.data.data._id,
          name: res.data.data.name,
          email: res.data.data.email,
          role: res.data.data.role,
        });

        return { success: true };
      }
    } catch (err) {
      console.error(err);

      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Profile update failed',
      };
    }
  };

  // Logout
  const logout = () => {
    setToken('');
    setUser(null);

    localStorage.removeItem('token');

    delete axios.defaults.headers.common[
      'Authorization'
    ];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};