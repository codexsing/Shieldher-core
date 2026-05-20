import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../utils/api";
import { io } from "socket.io-client"; // Real-time triggers client side socket

const AdminSOS = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Dynamically get base URL for Socket (Removes /api if present)
  const SOCKET_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace("/api", "") 
    : "http://localhost:8000";

  // ── 1. HTTP Fetch (Initial load aur status filter change par) ──
  const fetchActiveCrisisChannels = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No admin token found. Postponing HTTP fetch.");
        return;
      }

      const { data } = await api.get(`/admin/sos?limit=50${filter ? `&status=${filter}` : ""}`);
      if (data?.success) {
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error("SOS feed sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── 2. Handle Incident Resolution ──
  const handleResolveDispatch = async (sosId) => {
    if (!window.confirm("Are you sure you want to resolve and archive this emergency log?")) return;
    try {
      const { data } = await api.patch(`/admin/sos/${sosId}/resolve`);
      if (data?.success) fetchActiveCrisisChannels();
    } catch (err) {
      console.error("Resolution update breakdown:", err);
    }
  };

  // HTTP pipeline monitor
  useEffect(() => {
    fetchActiveCrisisChannels();
  }, [filter]);

  // ── 3. Real-Time Socket Connection & Event Handlers ──
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      console.log("Socket skipped: Waiting for authentication layer.");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"] 
    });

    socket.on("connect", () => {
      console.log("Live real-time monitoring channel connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    // Event A: Naya SOS Trigger hua
    socket.on("new-sos", (newIncident) => {
      setAlerts((prevAlerts) => {
        const exists = prevAlerts.some((alert) => alert._id === newIncident._id);
        if (exists) return prevAlerts;
        return [newIncident, ...prevAlerts];
      });
    });

    // Event B: Live Coordinates Update
    socket.on("sos-location-update", (data) => {
      const targetSosId = data.sosId || data.sos_id;
      const locationData = data.currentLocation || data.location || data;

      if (!targetSosId) return;

      setAlerts((prevAlerts) =>
        prevAlerts.map((sos) =>
          sos._id === targetSosId
            ? { ...sos, currentLocation: locationData }
            : sos
        )
      );
    });

    // Event C: Real-Time Forensic Payload Received
    socket.on("new-evidence", (data) => {
      const targetSosId = data.sosId || data.sos_id;
      const newMedia = data.evidence || data.evidences || data.media || data;

      if (!targetSosId) return;

      setAlerts((prevAlerts) =>
        prevAlerts.map((sos) => {
          if (sos._id === targetSosId) {
            const currentEvidences = sos.evidences || sos.evidence || sos.media || [];
            return { 
              ...sos, 
              evidences: [...currentEvidences, ...(Array.isArray(newMedia) ? newMedia : [newMedia])] 
            };
          }
          return sos;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <AdminLayout>
      {/* Clear Standard Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Emergency Alerts</h1>
          <p className="text-sm text-gray-400">Track incoming real-time emergency reports and auto-captured files</p>
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#0d0e12] border border-gray-900 text-gray-300 font-medium text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#ec4899]/40 transition-colors cursor-pointer"
        >
          <option value="">All Emergency Logs</option>
          <option value="active">🔴 Active Alerts Only</option>
          <option value="resolved">🟢 Resolved Logs</option>
        </select>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-6 w-6 rounded-full border-2 border-t-[#ec4899] border-gray-800 animate-spin" />
          Connecting live monitoring pipeline...
        </div>
      ) : (
        <div className="space-y-5">
          {alerts.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0e12] border border-gray-900/60 border-dashed rounded-2xl text-sm text-gray-500 font-medium tracking-wide">
              No emergency cases reported at the moment.
            </div>
          ) : (
            alerts.map((sos) => {
              const lat = sos.currentLocation?.lat || sos.startLocation?.lat || sos.user?.lastLocation?.lat;
              const lng = sos.currentLocation?.lng || sos.startLocation?.lng || sos.user?.lastLocation?.lng;

              const rawEvidence = sos.evidences || sos.evidence || sos.attachments || sos.media || [];
              const safeEvidences = Array.isArray(rawEvidence) ? rawEvidence : (rawEvidence ? [rawEvidence] : []);

              return (
                <div 
                  key={sos._id} 
                  className={`bg-[#0d0e12] border rounded-2xl p-6 transition-all duration-300 ${
                    sos.status === "active" 
                      ? "border-red-500/30 bg-gradient-to-r from-red-950/10 via-transparent to-transparent shadow-[0_4px_20px_rgba(239,68,68,0.04)]" 
                      : "border-gray-900"
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-gray-900/40 pb-4 mb-5 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sos.status === "active" 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {sos.status === "active" ? "Live Active" : "Resolved"}
                      </span>
                      <span>{new Date(sos.createdAt).toLocaleString()}</span>
                    </div>
                    <span className="font-mono text-xs text-gray-600">ID: {sos._id.toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Frame: User Information */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] font-semibold tracking-wider uppercase text-[#ec4899] mb-1.5">User Identity</div>
                        <p className="text-base font-bold text-white tracking-wide">{sos.user?.name || "Unknown Identity"}</p>
                        <p className="text-sm text-gray-400 mt-1">📱 {sos.user?.phone || "No phone linked"}</p>
                        <p className="text-sm text-gray-500">{sos.user?.email}</p>
                      </div>

                      <div className="inline-block bg-[#12151c] border border-gray-900 rounded-xl px-3 py-1.5 text-xs text-gray-400 font-medium">
                        Trigger Method: <span className="text-amber-500 font-bold uppercase">{sos.trigger || "Button Click"}</span>
                      </div>
                    </div>

                    {/* Right Frame: Location & Files Showcase */}
                    <div className="space-y-5 md:border-l md:border-gray-900/40 md:pl-6">
                      {/* GPS Telemetry */}
                      <div>
                        <div className="text-[11px] font-semibold tracking-wider uppercase text-[#ec4899] mb-1.5">GPS Location Coordinates</div>
                        {lat && lng ? (
                          <div className="space-y-2">
                            <p className="text-xs font-mono bg-[#07080a] border border-gray-900 px-3 py-2.5 rounded-xl inline-block text-gray-300">
                              Latitude: {parseFloat(lat).toFixed(6)} // Longitude: {parseFloat(lng).toFixed(6)}
                            </p>
                            <div>
                              <a 
                                href={`https://www.google.com/maps?q=${lat},${lng}`}
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-medium text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                🗺️ View live location on Google Maps →
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No GPS signal locked.</p>
                        )}
                      </div>

                      {/* Evidence Files Showcase */}
                      <div>
                        <div className="text-[11px] font-semibold tracking-wider uppercase text-blue-400 mb-2 flex items-center gap-1.5">
                          Cloudinary Files Uploaded ({safeEvidences.length})
                        </div>
                        
                        {safeEvidences.length > 0 ? (
                          <div className="flex flex-wrap gap-2.5">
                            {safeEvidences.map((media, idx) => {
                              const imgUrl = typeof media === "string" ? media : (media?.secure_url || media?.url);
                              if (!imgUrl) return null;

                              const isVideo = imgUrl.match(/\.(mp4|webm|mov|avi|m4v)$/i);
                              const isAudio = imgUrl.match(/\.(mp3|wav|ogg|aac|m4a)$/i);

                              return (
                                <div 
                                  key={media._id || idx}
                                  className="group relative border border-gray-800 hover:border-red-500/30 bg-[#07080a] rounded-lg overflow-hidden transition-all p-0.5"
                                >
                                  {isVideo ? (
                                    <video src={imgUrl} controls className="h-14 w-14 object-cover rounded" />
                                  ) : isAudio ? (
                                    <div className="p-1 bg-gray-900 rounded flex items-center justify-center h-14 w-24">
                                      <audio src={imgUrl} controls className="w-full scale-75" />
                                    </div>
                                  ) : (
                                    <a 
                                      href={imgUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="block relative cursor-pointer"
                                    >
                                      <img 
                                        src={imgUrl} 
                                        alt="Uploaded Incident File" 
                                        className="h-14 w-14 object-cover group-hover:scale-105 transition-transform rounded" 
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = "https://placehold.co/100x100/0d0e12/ffffff?text=FILE";
                                        }}
                                      />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">No dynamic media uploads synced.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Resolution Handling Actions */}
                  {sos.status === "active" && (
                    <div className="mt-6 pt-4 border-t border-gray-900/40 flex justify-end">
                      <button 
                        onClick={() => handleResolveDispatch(sos._id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold tracking-wide text-xs px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)] active:scale-95"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSOS;