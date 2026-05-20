import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Circle, Popup, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import BottomNav from "../components/BottomNav";
import { PageWrapper, AlertBanner } from "../components/UI";
 
// ── Fix Leaflet default marker icons ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
 
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
 
// ── Risk helpers ──────────────────────────────────────────
const riskFromSeverity = (s) => (s >= 4 ? "high" : s >= 2 ? "moderate" : "low");
 
const riskMeta = {
  high:     {
    color: "#ff3b3b", fill: "rgba(255,59,59,0.22)",
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    dot: "bg-red-500", ring: "border-red-500/30",
    label: "High Risk", emoji: "🔴", glow: "shadow-[0_0_12px_rgba(255,59,59,0.4)]"
  },
  moderate: {
    color: "#ffb830", fill: "rgba(255,184,48,0.18)",
    badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    dot: "bg-amber-400", ring: "border-amber-500/30",
    label: "Moderate", emoji: "🟡", glow: "shadow-[0_0_12px_rgba(255,184,48,0.3)]"
  },
  low:      {
    color: "#4da6ff", fill: "rgba(77,166,255,0.15)",
    badge: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    dot: "bg-blue-400", ring: "border-blue-500/30",
    label: "Low Risk", emoji: "🔵", glow: "shadow-[0_0_12px_rgba(77,166,255,0.25)]"
  },
};
 
const CATEGORIES = [
  { value: "harassment",    label: "Harassment / Being followed", icon: "😰" },
  { value: "poor_lighting", label: "Poorly lit area",              icon: "🌑" },
  { value: "stalking",      label: "Aggressive strangers",         icon: "⚠️" },
  { value: "unsafe_area",   label: "Isolated / No help nearby",    icon: "🚫" },
  { value: "other",         label: "Other concern",                icon: "📍" },
];
 
// ── Recenter map ──────────────────────────────────────────
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1.2 }); }, [center]);
  return null;
};
 
// ── User dot icon ─────────────────────────────────────────
const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#ec4899;border:3px solid white;
    box-shadow:0 0 0 4px rgba(236,72,153,0.3), 0 0 16px rgba(236,72,153,0.6);
    animation: pulse-dot 2s ease-in-out infinite;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
 
// ── Stat Card ─────────────────────────────────────────────
const StatCard = ({ emoji, count, label, color }) => (
  <div className={`flex-1 rounded-2xl p-3 bg-white/5 border border-white/10 text-center`}>
    <div className="text-xl mb-0.5">{emoji}</div>
    <div className={`text-xl font-bold ${color}`}>{count}</div>
    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
  </div>
);
 
// ── Zone Card ─────────────────────────────────────────────
const ZoneCard = ({ zone, onUpvote }) => {
  const risk = riskFromSeverity(zone.weight / (zone.count || 1));
  const s = riskMeta[risk];
  const cat = CATEGORIES.find(c => c.value === zone.category) || { icon: "📍", label: zone.category || "Unsafe Area" };
 
  return (
    <div className={`rounded-2xl p-4 bg-white/5 border ${s.ring} hover:bg-white/8 transition-all duration-200 group`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-white/10 ${s.glow} group-hover:scale-105 transition-transform`}>
          {cat.icon}
        </div>
 
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm capitalize">
              {cat.label}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.badge}`}>
              {s.label}
            </span>
          </div>
 
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-white/40 text-xs font-mono">
              {zone.lat?.toFixed(4)}, {zone.lng?.toFixed(4)}
            </span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-white/40 text-xs">
              {zone.count} report{zone.count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
 
        {/* Upvote */}
        <button
          onClick={(e) => onUpvote(zone._id, e)}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all active:scale-95"
        >
          <span className="text-xs">▲</span>
          <span className="text-white/60 text-xs font-mono">{zone.upvotes || 0}</span>
        </button>
      </div>
    </div>
  );
};
 
// ── Report Modal ──────────────────────────────────────────
const ReportModal = ({ report, setReport, onSubmit, onClose, submitting }) => {
  const sevColor = report.severity >= 4 ? "text-red-400" : report.severity >= 2 ? "text-amber-400" : "text-blue-400";
  const sevLabel = report.severity >= 4 ? "High Risk" : report.severity >= 2 ? "Moderate" : "Low Risk";
 
  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
 
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        zIndex: 99999,                         // beat Leaflet's z-index completely
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 1rem 1.5rem",
        background: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 460,
          borderRadius: "1.5rem", padding: "1.25rem",
          background: "linear-gradient(160deg, #1c1c35 0%, #14142a 100%)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", gap: "1rem",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">Flag Danger Zone</p>
            <p className="text-white/40 text-xs mt-0.5">100% anonymous · helps keep community safe</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>
 
        {/* Location pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-white/60 text-xs font-mono">
            {report.lat && report.lng
              ? `${Number(report.lat).toFixed(5)}, ${Number(report.lng).toFixed(5)}`
              : "Detecting your location…"}
          </span>
        </div>
 
        {/* Category grid */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">What happened?</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setReport(r => ({ ...r, category: c.value }))}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left
                  ${report.category === c.value
                    ? "bg-pink-500/20 border border-pink-500/50 text-pink-300"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"}`}
              >
                <span>{c.icon}</span>
                <span className="leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
 
        {/* Severity */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-white/40 text-xs uppercase tracking-wider">Severity</p>
            <span className={`text-xs font-semibold ${sevColor}`}>{sevLabel} ({report.severity}/5)</span>
          </div>
          <div className="relative">
            <input
              type="range" min={1} max={5} step={1}
              value={report.severity}
              onChange={(e) => setReport(r => ({ ...r, severity: Number(e.target.value) }))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${
                  report.severity >= 4 ? "#ef4444" : report.severity >= 2 ? "#f59e0b" : "#3b82f6"
                } ${(report.severity - 1) * 25}%, rgba(255,255,255,0.1) ${(report.severity - 1) * 25}%)`
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {["1","2","3","4","5"].map(n => (
              <span key={n} className="text-white/20 text-xs">{n}</span>
            ))}
          </div>
        </div>
 
        {/* Description */}
        <textarea
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-pink-500/50 resize-none transition-colors"
          rows={2}
          placeholder="Add details (optional, stays anonymous)…"
          value={report.description}
          onChange={(e) => setReport(r => ({ ...r, description: e.target.value }))}
        />
 
        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={submitting || !report.lat}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: submitting ? "#555" : "linear-gradient(135deg, #ec4899, #f43f5e)" }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting…
            </span>
          ) : "⚠️ Submit Anonymously"}
        </button>
      </div>
    </div>
  );
};
 
// ── Main Component ────────────────────────────────────────
const Heatmap = () => {
  const [zones,      setZones]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [userPos,    setUserPos]    = useState(null);
  const [filter,     setFilter]     = useState("all");
  const [reporting,  setReporting]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");
  const [mapReady,   setMapReady]   = useState(false);
 
  const [report, setReport] = useState({
    lat: "", lng: "", description: "", category: "other", severity: 3,
  });
 
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
 
  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/heatmap`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) setZones(json.data || []);
      else setError("Failed to load danger zones.");
    } catch {
      setError("Network error — could not load heatmap.");
    } finally {
      setLoading(false);
    }
  }, [token]);
 
  useEffect(() => { fetchZones(); }, [fetchZones]);
 
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = [p.coords.latitude, p.coords.longitude];
        setUserPos(pos);
        setReport(r => ({ ...r, lat: pos[0].toFixed(6), lng: pos[1].toFixed(6) }));
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);
 
  const submitReport = async () => {
    if (!report.lat || !report.lng) {
      setError("Location unavailable. Please allow location access.");
      return;
    }
    try {
      setSubmitting(true);
      const res  = await fetch(`${API}/heatmap/report`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          lat: Number(report.lat), lng: Number(report.lng),
          description: report.description,
          category: report.category,
          severity: Number(report.severity),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReporting(false);
        setReport(r => ({ ...r, description: "", category: "other", severity: 3 }));
        setSuccess("Zone reported. Thank you for keeping the community safe 🙏");
        setTimeout(() => setSuccess(""), 5000);
        fetchZones();
      } else {
        setError(json.message || "Failed to submit report.");
      }
    } catch {
      setError("Network error — could not submit report.");
    } finally {
      setSubmitting(false);
    }
  };
 
  const upvoteZone = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/heatmap/${id}/upvote`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchZones();
    } catch {}
  };
 
  const filtered = zones.filter(z =>
    filter === "all" ? true : riskFromSeverity(z.weight / (z.count || 1)) === filter
  );
 
  const counts = {
    high:     zones.filter(z => riskFromSeverity(z.weight / (z.count || 1)) === "high").length,
    moderate: zones.filter(z => riskFromSeverity(z.weight / (z.count || 1)) === "moderate").length,
    low:      zones.filter(z => riskFromSeverity(z.weight / (z.count || 1)) === "low").length,
  };
 
  const mapCenter = userPos || [20.5937, 78.9629];
 
  return (
    <>
    <PageWrapper>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        .map-wrapper .leaflet-container { border-radius: 1.25rem; }
 
        /* ── CRITICAL: Reset Leaflet stacking so modal always wins ── */
        .map-wrapper { isolation: isolate; position: relative; z-index: 0; }
        .map-wrapper .leaflet-pane,
        .map-wrapper .leaflet-top,
        .map-wrapper .leaflet-bottom { z-index: auto !important; }
      `}</style>
 
      <div className="min-h-screen pb-28" style={{ background: "#0d0d1a" }}>
 
        {/* ── Header ── */}
        <header className="px-5 pt-12 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Safety Map
              </h1>
              <p className="text-white/40 text-sm mt-0.5">
                {zones.length} active zone{zones.length !== 1 ? "s" : ""} · crowdsourced
              </p>
            </div>
            <button
              onClick={() => setReporting(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
            >
              <span>⚠️</span>
              <span>Report</span>
            </button>
          </div>
        </header>
 
        <div className="px-4 space-y-4">
 
          {/* Banners */}
          {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}
          {error   && <AlertBanner type="error"   message={error}   onClose={() => setError("")}   />}
 
          {/* ── Stats row ── */}
          <div className="flex gap-2">
            <StatCard emoji="🔴" count={counts.high}     label="High"     color="text-red-400" />
            <StatCard emoji="🟡" count={counts.moderate} label="Moderate" color="text-amber-400" />
            <StatCard emoji="🔵" count={counts.low}      label="Low"      color="text-blue-400" />
          </div>
 
          {/* ── Map ── */}
          <div className="relative rounded-[1.25rem] overflow-hidden map-wrapper" style={{ height: 260, border: "1px solid rgba(255,255,255,0.08)" }}>
            {!mapReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[1.25rem]" style={{ background: "#11112a" }}>
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-xs">Loading map…</p>
              </div>
            )}
 
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              whenReady={() => setMapReady(true)}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
 
              {userPos && <RecenterMap center={userPos} />}
 
              {userPos && (
                <Marker position={userPos} icon={userIcon}>
                  <Popup><span className="text-xs font-mono">📍 You are here</span></Popup>
                </Marker>
              )}
 
              {zones.map((z, i) => {
                const risk = riskFromSeverity(z.weight / (z.count || 1));
                const meta = riskMeta[risk];
                const intensity = Math.min((z.count || 1) * 0.04, 0.45);
                return (
                  <Circle
                    key={i}
                    center={[z.lat, z.lng]}
                    radius={120}
                    pathOptions={{
                      color:       meta.color,
                      fillColor:   meta.color,
                      fillOpacity: 0.22 + intensity,
                      weight:      2,
                      dashArray:   risk === "high" ? undefined : "4 4",
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1.5 min-w-[150px] p-1">
                        <p className="font-bold text-sm capitalize">{risk} risk</p>
                        <p>📊 {z.count} report{z.count !== 1 ? "s" : ""}</p>
                        {z.category && (
                          <p>🏷️ {z.category.replace(/_/g, " ")}</p>
                        )}
                        <button
                          onClick={(e) => upvoteZone(z._id, e)}
                          className="mt-1 px-3 py-1 rounded-lg text-white text-xs font-semibold"
                          style={{ background: "#ec4899" }}
                        >
                          ▲ Confirm ({z.upvotes || 0})
                        </button>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </MapContainer>
 
            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-[400] flex gap-2">
              {Object.entries(riskMeta).map(([key, m]) => (
                <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/70 font-medium"
                  style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <span className="capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* ── Filter tabs ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: "all",      label: "All Zones" },
              { key: "high",     label: "🔴 High"     },
              { key: "moderate", label: "🟡 Moderate" },
              { key: "low",      label: "🔵 Low"      },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all
                  ${filter === f.key
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"}`}
                style={filter === f.key
                  ? { background: "linear-gradient(135deg, #ec4899, #f43f5e)" }
                  : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {f.label}
              </button>
            ))}
          </div>
 
          {/* ── Zone list ── */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wider font-semibold mb-3">
              {loading ? "Loading…" : `${filtered.length} zone${filtered.length !== 1 ? "s" : ""} found`}
            </p>
 
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="rounded-2xl p-4 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded w-2/3" />
                        <div className="h-2.5 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-3xl mb-3">🗺️</div>
                <p className="text-white/50 text-sm font-medium">No danger zones in this area</p>
                <p className="text-white/25 text-xs mt-1">Be the first to report one</p>
                <button
                  onClick={() => setReporting(true)}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.3)" }}
                >
                  + Report a zone
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((zone, i) => (
                  <ZoneCard key={i} zone={zone} onUpvote={upvoteZone} />
                ))}
              </div>
            )}
          </div>
 
          {/* Bottom padding */}
          <div className="h-4" />
        </div>
      </div>
 
      <BottomNav />
    </PageWrapper>
 
      {/* ── Report Modal — rendered via portal on document.body to escape Leaflet z-index ── */}
      {reporting && createPortal(
        <ReportModal
          report={report}
          setReport={setReport}
          onSubmit={submitReport}
          onClose={() => setReporting(false)}
          submitting={submitting}
        />,
        document.body
      )}
    </>
  );
};
 
export default Heatmap;