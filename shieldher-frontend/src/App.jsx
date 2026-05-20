// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// User Pages
import Register   from "./pages/Register";
import Login      from "./pages/Login";
import VerifyOtp  from "./pages/VerifyOtp";
import Dashboard  from "./pages/Dashboard";
import SOS        from "./pages/SOS";
import Journey    from "./pages/Journey";
import Heatmap    from "./pages/Heatmap";
import Profile    from "./pages/Profile";

// Admin Pages (New)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers     from "./pages/admin/AdminUsers";
import AdminSOS       from "./pages/admin/AdminSOS";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/register"   element={<Register />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* User Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sos"       element={<ProtectedRoute><SOS /></ProtectedRoute>} />
        <Route path="/journey"   element={<ProtectedRoute><Journey /></ProtectedRoute>} />
        <Route path="/heatmap"   element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"     element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/sos"       element={<ProtectedRoute adminOnly={true}><AdminSOS /></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;