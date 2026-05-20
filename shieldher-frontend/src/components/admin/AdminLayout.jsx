// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [toggle, setToggle] = useState(false);

  const performLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-[#c5c6c7] flex flex-col md:flex-row font-sans antialiased">
      
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-[#0d0e12] border-b border-gray-900 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ec4899] shadow-[0_0_8px_#ec4899]" />
          <span className="font-bold text-sm tracking-wide text-white">ShieldHer Admin</span>
        </div>
        <button 
          onClick={() => setToggle(!toggle)} 
          className="text-[#ec4899] text-2xl focus:outline-none"
        >
          {toggle ? "✕" : "☰"}
        </button>
      </header>

      {/* Sidebar Panel Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0d0e12] border-r border-gray-900/60 p-6 flex flex-col justify-between z-40 transform ${toggle ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 md:relative md:translate-x-0 md:flex`}>
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-2 px-2 py-2 border-b border-gray-900/40">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ec4899] shadow-[0_0_10px_#ec4899] animate-pulse" />
            <span className="font-bold text-base tracking-tight text-white uppercase">ShieldHer Core</span>
          </div>

          {/* User Friendly Navigation Links */}
          <nav className="space-y-1.5 text-sm font-medium">
            <NavLink 
              to="/admin/dashboard" 
              onClick={() => setToggle(false)} 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-[#ec4899]/10 text-[#ec4899] border border-[#ec4899]/20 font-semibold shadow-[0_4px_15px_rgba(236,72,153,0.02)]" 
                  : "text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent"
              }`}
            >
              <span className="text-base">📊</span> Dashboard
            </NavLink>

            <NavLink 
              to="/admin/users" 
              onClick={() => setToggle(false)} 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-[#ec4899]/10 text-[#ec4899] border border-[#ec4899]/20 font-semibold shadow-[0_4px_15px_rgba(236,72,153,0.02)]" 
                  : "text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent"
              }`}
            >
              <span className="text-base">👥</span> User Profiles
            </NavLink>

            <NavLink 
              to="/admin/sos" 
              onClick={() => setToggle(false)} 
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-[#ec4899]/10 text-[#ec4899] border border-[#ec4899]/20 font-semibold shadow-[0_4px_15px_rgba(236,72,153,0.02)]" 
                  : "text-gray-400 hover:text-white hover:bg-gray-900/40 border border-transparent"
              }`}
            >
              <span className="text-base">🚨</span> Emergency Alerts
            </NavLink>
          </nav>
        </div>

        {/* Clean Logout Action Button */}
        <button 
          onClick={performLogout} 
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-[0.98]"
        >
          <span>🚪</span> Log Out
        </button>
      </aside>

      {/* Backdrop for Mobile Drawer */}
      {toggle && (
        <div 
          onClick={() => setToggle(false)} 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden" 
        />
      )}

      {/* Main Content View Frame */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-hidden">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;