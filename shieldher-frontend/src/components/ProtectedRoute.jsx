// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth(); // Context se user data bhi nikal lo
  const location = useLocation();

  // 1. Agar login hi nahi hai, toh sidha login screen par bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Agar page sirf admin ke liye hai par logged-in user admin nahi hai
  if (adminOnly && user?.role !== "admin") {
    // Normal user ko admin routes se bhaga kar uske normal user dashboard par fenk do
    return <Navigate to="/dashboard" replace />;
  }

  // Sab sahi hai toh component dikhao
  return children;
};

export default ProtectedRoute;