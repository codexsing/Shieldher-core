// src/context/AuthContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const clearError = () => setError(null);

  const register = useCallback(async (formData) => {
    setLoading(true); setError(null);
    try {
      const { data } = await authAPI.register(formData);
      return { success: true, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    setLoading(true); setError(null);
    try {
      await authAPI.verifyOtp({ email, otp });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  }, []);

  const resendOtp = useCallback(async (email) => {
    setLoading(true); setError(null);
    try {
      await authAPI.resendOtp({ email });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Could not resend OTP.";
      setError(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true); setError(null);
    try {
      const { data } = await authAPI.login(credentials);
      const { accessToken, refreshToken, user: userData } = data.data;
      
      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user",         JSON.stringify(userData));
      
      setUser(userData);
      
      // 🔥 FIX: userData ko return karo taaki Login.jsx isme se role nikal sake
      return { success: true, data: { user: userData } };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!localStorage.getItem("accessToken");

  return (
    <AuthContext.Provider value={{
      user, loading, error, isAuthenticated,
      register, verifyOtp, resendOtp, login, logout, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};