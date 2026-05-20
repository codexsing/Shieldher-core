import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalSOS: 0, 
    activeSOS: 0, 
    totalJourneys: 0, 
    totalZones: 0, 
    totalEvidences: 0 
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return; 

        const { data } = await api.get("/admin/dashboard");
        if (data?.success) setStats(data.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatrix();
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="h-[50vh] flex flex-col items-center justify-center gap-2 font-sans text-sm text-gray-400">
        <div className="h-6 w-6 rounded-full border-2 border-t-[#ec4899] border-gray-800 animate-spin" />
        Loading Dashboard Data...
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* Simple & Clean Header */}
      <div className="mb-10 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Real-time overview of system activities and security alerts</p>
      </div>

      {/* Grid System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Active Emergency Alerts */}
        <div 
          onClick={() => navigate("/admin/sos?status=active")}
          className={`bg-[#0d0e12] border p-6 relative rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
            stats.activeSOS > 0 
              ? "border-red-500/40 bg-gradient-to-br from-red-950/10 to-transparent shadow-[0_4px_25px_rgba(239,68,68,0.1)] hover:border-red-500" 
              : "border-gray-900 hover:border-gray-800"
          }`}
        >
          {stats.activeSOS > 0 && (
            <span className="absolute top-6 right-6 flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Active Emergencies</h3>
          <p className={`text-6xl font-bold tracking-tight transition-all ${
            stats.activeSOS > 0 ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "text-gray-600"
          }`}>
            {String(stats.activeSOS || 0).padStart(2, "0")}
          </p>
          <div className="mt-4 text-[11px] text-gray-400 font-medium tracking-wide flex items-center gap-1.5">
            <span className={stats.activeSOS > 0 ? "text-red-400" : "text-gray-500"}>🚨</span> 
            Live SOS reports needing attention
          </div>
        </div>

        {/* Card 2: Total Registered Users */}
        <div 
          onClick={() => navigate("/admin/users")}
          className="bg-[#0d0e12] border border-gray-900 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:border-[#ec4899]/40"
        >
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Total Users</h3>
          <p className="text-6xl font-bold text-white tracking-tight">
            {String(stats.totalUsers || 0).padStart(2, "0")}
          </p>
          <div className="mt-4 text-[11px] text-[#ec4899] opacity-80 font-medium tracking-wide">👥 Registered profiles on the app</div>
        </div>

        {/* Card 3: Cumulative Signals (Total SOS) */}
        <div 
          onClick={() => navigate("/admin/sos")}
          className="bg-[#0d0e12] border border-gray-900 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-700"
        >
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Total SOS Raised</h3>
          <p className="text-6xl font-bold text-white tracking-tight">
            {String(stats.totalSOS || 0).padStart(2, "0")}
          </p>
          <div className="mt-4 text-[11px] text-gray-500 font-medium tracking-wide">📊 Lifetime history of emergency triggers</div>
        </div>

        {/* Card 4: Transit Paths (Active Journeys) */}
        <div className="bg-[#0d0e12] border border-gray-900 rounded-2xl p-6 transition-all duration-300 hover:border-gray-800">
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Active Journeys</h3>
          <p className="text-6xl font-bold text-white tracking-tight">
            {String(stats.totalJourneys || 0).padStart(2, "0")}
          </p>
          <div className="mt-4 text-[11px] text-gray-500 font-medium tracking-wide">🛰️ Live route-tracking sessions</div>
        </div>

        {/* Card 5: Reported Danger Clusters */}
        <div className="bg-[#0d0e12] border border-gray-900 rounded-2xl p-6 transition-all duration-300 hover:border-orange-500/40">
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Reported Danger Zones</h3>
          <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 tracking-tight">
            {String(stats.totalZones || 0).padStart(2, "0")}
          </p>
          <div className="mt-4 text-[11px] text-orange-400 opacity-80 font-medium tracking-wide">🔥 Custom danger hotspots marked by users</div>
        </div>

        {/* Card 6: Evidence Assets */}
        <div 
          onClick={() => navigate("/admin/sos")}
          className="bg-[#0d0e12] border border-gray-900 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-500/40"
        >
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Evidence Files</h3>
          <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
            {String(stats.totalEvidences || 0).padStart(2, "0")}
          </p>
          <div className="mt-4 text-[11px] text-blue-400 opacity-80 font-medium tracking-wide">🛡️ Uploaded media files (Cloudinary)</div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;