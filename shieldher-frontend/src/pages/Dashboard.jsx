import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";
import { ShieldLogo, StatCard, PageWrapper } from "../components/UI";
 
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
 
// ── helper: read token from correct key ──────────────────
const getToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken") ||
  localStorage.getItem("token") || "";
 
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
 
// ── Skeleton pulse block ─────────────────────────────────
const Skel = ({ w = "w-full", h = "h-4", cls = "" }) => (
  <div className={`${w} ${h} ${cls} rounded-lg bg-white/8 animate-pulse`} />
);
 
// ── Threat Meter ─────────────────────────────────────────
const ThreatMeter = ({ score = 0, loading }) => {
  const color =
    score < 30 ? "#00E5A0" : score < 60 ? "#FFB020" : "#FF3B30";
  const label =
    score < 30 ? "LOW RISK" : score < 60 ? "MODERATE" : "HIGH RISK";
  const hour  = new Date().getHours();
  const timeLabel = hour < 6 ? "Late Night" : hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : hour < 21 ? "Evening" : "Night";
 
  return (
    <div className="card p-5 space-y-3 glow-border">
      <div className="flex items-center justify-between">
        <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">
          AI Threat Score
        </p>
        {loading ? (
          <Skel w="w-24" h="h-5" />
        ) : (
          <span className="status-badge" style={{ backgroundColor: `${color}22`, color }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block mr-1" style={{ backgroundColor: color }} />
            {label}
          </span>
        )}
      </div>
 
      <div className="flex flex-col items-center py-2">
        <div className="relative w-36 h-20 overflow-hidden">
          <svg viewBox="0 0 120 60" className="w-full h-full">
            <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="#2A2A3E" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M10,60 A50,50 0 0,1 110,60"
              fill="none"
              stroke={loading ? "#2A2A3E" : color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 157} 157`}
              style={{ filter: loading ? "none" : `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            {loading ? (
              <Skel w="w-10" h="h-7" cls="mx-auto" />
            ) : (
              <>
                <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
                <span className="text-shield-muted text-xs font-mono">/100</span>
              </>
            )}
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["🕐", "Time",  timeLabel],
          ["📍", "Area",  "Nearby"],
          ["🌡️", "Level", label.split(" ")[0]],
        ].map(([icon, k, v]) => (
          <div key={k} className="bg-shield-surface rounded-lg p-2">
            <div className="text-base">{icon}</div>
            <div className="text-shield-muted text-xs font-body">{k}</div>
            <div className="text-white text-xs font-semibold font-mono">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
 
// ── Quick Action card ─────────────────────────────────────
const QuickAction = ({ to, icon, label, color = "text-shield-pink", pulse = false }) => (
  <Link
    to={to}
    className="card p-4 flex flex-col items-center gap-2 hover:border-shield-pink/50 transition-all duration-200 active:scale-95"
  >
    <div className="relative">
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping-slow opacity-40" style={{ background: "#FF2D78" }} />
      )}
      <span className="text-2xl">{icon}</span>
    </div>
    <span className={`text-xs font-display font-semibold uppercase tracking-wide ${color}`}>{label}</span>
  </Link>
);
 
// ── Activity item ─────────────────────────────────────────
const ActivityItem = ({ icon, label, sub, time, color }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <span className="text-lg">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-body font-medium truncate ${color}`}>{label}</p>
      <p className="text-shield-muted text-xs font-body">{sub}</p>
    </div>
    <span className="text-shield-muted text-xs font-mono flex-shrink-0">{time}</span>
  </div>
);
 
// ── relative time helper ──────────────────────────────────
const relTime = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
 
// ── Main Dashboard ────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
 
  // ── state ──────────────────────────────────────────────
  const [isTracking,  setIsTracking]  = useState(false);
  const [stats,       setStats]       = useState(null);
  const [contacts,    setContacts]    = useState([]);
  const [zones,       setZones]       = useState([]);
  const [sosList,     setSosList]     = useState([]);
  const [loadingStats,setLoadingStats]= useState(true);
  const [threatScore, setThreatScore] = useState(0);
 
  // ── fetch all dashboard data ───────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [contactsRes, zonesRes, sosRes] = await Promise.all([
        fetch(`${API}/contacts`,      { headers: authHeaders() }),
        fetch(`${API}/heatmap`,       { headers: authHeaders() }),
        fetch(`${API}/sos`,           { headers: authHeaders() }),
      ]);
 
      const [cJson, zJson, sJson] = await Promise.all([
        contactsRes.json(),
        zonesRes.json(),
        sosRes.json(),
      ]);
 
      const c = cJson.success  ? (cJson.data  || []) : [];
      const z = zJson.success  ? (zJson.data  || []) : [];
      const s = sJson.success  ? (sJson.data  || []) : [];
 
      setContacts(c);
      setZones(z);
      setSosList(s);
 
      // ── derive threat score from nearby high zones ──
      const highZones = z.filter(zone => {
        const avg = zone.weight / (zone.count || 1);
        return avg >= 4;
      }).length;
      const score = Math.min(Math.round((highZones / Math.max(z.length, 1)) * 100 * 1.4 + highZones * 3), 100);
      setThreatScore(score || 12); // default low if no data
 
      setStats({
        contacts:    c.length,
        dangerZones: z.length,
        activeSOS:   s.filter(x => x.status === "active").length,
        resolvedSOS: s.filter(x => x.status === "resolved").length,
      });
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);
 
  useEffect(() => { fetchAll(); }, [fetchAll]);
 
  // ── build recent activity from real data ───────────────
  const recentActivity = [];
 
  sosList.slice(0, 2).forEach(sos => {
    recentActivity.push({
      icon:  sos.status === "resolved" ? "✅" : "🆘",
      label: sos.status === "resolved" ? "SOS resolved safely" : "SOS triggered",
      sub:   sos.location?.address || `${sos.lat?.toFixed(3) || ""}, ${sos.lng?.toFixed(3) || ""}`,
      time:  relTime(sos.createdAt),
      color: sos.status === "resolved" ? "text-shield-success" : "text-red-400",
    });
  });
 
  zones.slice(0, 1).forEach(z => {
    recentActivity.push({
      icon:  "⚠️",
      label: `${z.category?.replace(/_/g, " ") || "Unsafe"} zone reported`,
      sub:   `${z.lat?.toFixed(3)}, ${z.lng?.toFixed(3)}`,
      time:  relTime(z.createdAt),
      color: "text-shield-warning",
    });
  });
 
  contacts.slice(0, 1).forEach(c => {
    recentActivity.push({
      icon:  "👤",
      label: `${c.name} added as trusted contact`,
      sub:   c.relationship || "Trusted guardian",
      time:  relTime(c.createdAt),
      color: "text-shield-pink",
    });
  });
 
  // fallback if no activity yet
  if (recentActivity.length === 0) {
    recentActivity.push({
      icon: "🛡️", label: "Welcome to ShieldHer", sub: "Your safety dashboard is ready",
      time: "now", color: "text-shield-success",
    });
  }
 
  return (
    <PageWrapper>
      <div className="min-h-screen pb-24 page-enter">
 
        {/* ── Top bar ── */}
        <header className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldLogo size={32} />
            <div>
              <p className="text-shield-muted text-xs font-body">{greeting},</p>
              <p className="text-white font-display font-bold text-lg leading-tight">
                {user?.name?.split(" ")[0] || "User"} 👋
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTracking(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all
              ${isTracking
                ? "bg-shield-success/20 text-shield-success border border-shield-success/30"
                : "bg-shield-surface text-shield-muted border border-shield-border"}`}
          >
            <span className={`w-2 h-2 rounded-full ${isTracking ? "bg-shield-success animate-pulse" : "bg-shield-muted"}`} />
            {isTracking ? "Protected" : "Standby"}
          </button>
        </header>
 
        <div className="px-4 space-y-4">
 
          {/* ── Threat Score ── */}
          <ThreatMeter score={threatScore} loading={loadingStats} />
 
          {/* ── SOS Banner ── */}
          <Link to="/sos" className="block">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 to-red-900 border border-red-800 p-5">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-700/20 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-xs font-display font-semibold uppercase tracking-widest">Emergency</p>
                  <p className="text-white text-xl font-display font-bold mt-0.5">SOS Center</p>
                  <p className="text-red-300/70 text-xs font-body mt-1">Tap or triple-shake to activate</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg sos-ring">
                  <span className="text-2xl">🆘</span>
                </div>
              </div>
            </div>
          </Link>
 
          {/* ── Quick Actions (Journey removed) ── */}
          <div>
            <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest mb-3">
              Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-3">
              <QuickAction to="/sos"     icon="🆘" label="SOS"      color="text-red-400"         pulse />
              <QuickAction to="/heatmap" icon="🗺"  label="Heatmap"  color="text-blue-400" />
              <QuickAction to="/profile" icon="👥" label="Contacts" color="text-shield-success" />
            </div>
          </div>
 
          {/* ── Live Stats ── */}
          <div>
            <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest mb-3">
              Your Safety Stats
            </p>
            {loadingStats ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(n => (
                  <div key={n} className="card p-4 space-y-2">
                    <Skel w="w-8" h="h-8" cls="rounded-xl" />
                    <Skel w="w-16" h="h-6" />
                    <Skel w="w-24" h="h-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon="👥" label="Trusted Contacts"
                  value={stats?.contacts ?? 0}
                  sub={stats?.contacts === 5 ? "Max reached" : `${5 - (stats?.contacts ?? 0)} slots left`}
                  color="text-shield-pink"
                />
                <StatCard
                  icon="🗺️" label="Danger Zones"
                  value={stats?.dangerZones ?? 0}
                  sub="In your area"
                  color="text-shield-warning"
                />
                <StatCard
                  icon="🆘" label="SOS Triggered"
                  value={stats?.activeSOS ?? 0}
                  sub={stats?.activeSOS ? "Active now" : "All clear"}
                  color="text-red-400"
                />
                <StatCard
                  icon="✅" label="SOS Resolved"
                  value={stats?.resolvedSOS ?? 0}
                  sub="Safely handled"
                  color="text-shield-success"
                />
              </div>
            )}
          </div>
 
          {/* ── Recent Activity ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">
                Recent Activity
              </p>
              <button
                onClick={fetchAll}
                className="text-shield-pink text-xs font-display hover:text-shield-rose transition-colors"
              >
                Refresh
              </button>
            </div>
 
            <div className="card divide-y divide-shield-border">
              {loadingStats ? (
                [1,2,3].map(n => (
                  <div key={n} className="flex items-center gap-3 px-4 py-3">
                    <Skel w="w-7" h="h-7" cls="rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skel w="w-3/4" h="h-3" />
                      <Skel w="w-1/2" h="h-2.5" />
                    </div>
                    <Skel w="w-10" h="h-2.5" />
                  </div>
                ))
              ) : (
                recentActivity.map((item, i) => (
                  <ActivityItem key={i} {...item} />
                ))
              )}
            </div>
          </div>
 
        </div>
      </div>
 
      <BottomNav />
    </PageWrapper>
  );
};
 
export default Dashboard;