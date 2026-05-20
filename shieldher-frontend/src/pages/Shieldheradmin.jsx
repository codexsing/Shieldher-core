import { useState, useEffect, useCallback } from "react";
 

const getToken = () => localStorage.getItem("adminToken");
 
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
 
// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Journey: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Zone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"1em",height:"1em"}}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};
 
// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
 
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
  :root {
    --bg:        #0a0b0f;
    --surface:   #111318;
    --surface2:  #181b22;
    --border:    #1f2430;
    --border2:   #2a3040;
    --text:      #e8eaf0;
    --muted:     #6b7280;
    --accent:    #e8557a;
    --accent2:   #ff8fab;
    --green:     #34d399;
    --amber:     #fbbf24;
    --red:       #f87171;
    --blue:      #60a5fa;
    --glow:      0 0 20px rgba(232,85,122,0.15);
  }
 
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
 
  .app { display: flex; min-height: 100vh; }
 
  /* ── SIDEBAR ── */
  .sidebar {
    width: 220px; min-height: 100vh; background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
  }
  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-logo .shield-icon {
    width: 34px; height: 34px; border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), #a8285e);
    display: grid; place-items: center; font-size: 16px; color: white;
    box-shadow: var(--glow);
  }
  .sidebar-logo span { font-size: 15px; font-weight: 800; letter-spacing: 0.5px; }
  .sidebar-logo small { display: block; font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1px; }
  .sidebar-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 2px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 600;
    color: var(--muted); transition: all 0.18s; letter-spacing: 0.3px;
    border: 1px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: var(--surface2); }
  .nav-item.active {
    color: var(--accent2); background: rgba(232,85,122,0.08);
    border-color: rgba(232,85,122,0.2);
  }
  .nav-item .icon { font-size: 15px; flex-shrink: 0; }
  .sidebar-footer {
    padding: 16px 10px; border-top: 1px solid var(--border);
  }
  .logout-btn {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 600;
    color: var(--muted); width: 100%; background: none; border: none;
    font-family: 'Syne', sans-serif; transition: all 0.18s;
  }
  .logout-btn:hover { color: var(--red); background: rgba(248,113,113,0.07); }
 
  /* ── MAIN ── */
  .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .topbar {
    padding: 16px 28px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface); position: sticky; top: 0; z-index: 50;
  }
  .topbar h1 { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .admin-badge {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 1.5px;
    padding: 5px 10px; border-radius: 20px;
    background: rgba(232,85,122,0.1); color: var(--accent2); border: 1px solid rgba(232,85,122,0.25);
  }
  .page { padding: 28px; flex: 1; }
 
  /* ── STAT CARDS ── */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 20px; position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.4s ease both;
  }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .stat-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--card-color, transparent) 0%, transparent 60%);
    opacity: 0.05; pointer-events: none;
  }
  .stat-card .label { font-size: 11px; font-family: 'DM Mono', monospace; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; }
  .stat-card .value { font-size: 32px; font-weight: 800; line-height: 1; }
  .stat-card .icon-wrap { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.3; }
  .stat-card.red    { --card-color: #f87171; } .stat-card.red .value    { color: var(--red); }
  .stat-card.amber  { --card-color: #fbbf24; } .stat-card.amber .value  { color: var(--amber); }
  .stat-card.green  { --card-color: #34d399; } .stat-card.green .value  { color: var(--green); }
  .stat-card.blue   { --card-color: #60a5fa; } .stat-card.blue .value   { color: var(--blue); }
  .stat-card.pink   { --card-color: #e8557a; } .stat-card.pink .value   { color: var(--accent2); }
 
  /* ── SECTION HEADER ── */
  .section-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
  }
  .section-header h2 { font-size: 15px; font-weight: 700; letter-spacing: 0.4px; }
 
  /* ── TABLE ── */
  .table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    animation: fadeUp 0.5s ease both;
  }
  .table-toolbar {
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .search-box {
    flex: 1; min-width: 160px; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 12px; color: var(--text); font-family: 'Syne', sans-serif;
    font-size: 13px; outline: none; transition: border-color 0.18s;
  }
  .search-box:focus { border-color: var(--border2); }
  .filter-select {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 8px 12px; color: var(--text); font-family: 'Syne', sans-serif; font-size: 13px;
    outline: none; cursor: pointer;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead tr { border-bottom: 1px solid var(--border); }
  thead th {
    padding: 11px 16px; text-align: left; font-size: 10.5px;
    font-family: 'DM Mono', monospace; letter-spacing: 1.5px; color: var(--muted); text-transform: uppercase;
  }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--surface2); }
  td { padding: 13px 16px; vertical-align: middle; }
 
  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600;
    font-family: 'DM Mono', monospace; letter-spacing: 0.5px;
  }
  .badge.active   { background: rgba(248,113,113,0.12); color: var(--red); border: 1px solid rgba(248,113,113,0.25); }
  .badge.resolved { background: rgba(52,211,153,0.1);  color: var(--green); border: 1px solid rgba(52,211,153,0.2); }
  .badge.pending  { background: rgba(251,191,36,0.1);  color: var(--amber); border: 1px solid rgba(251,191,36,0.2); }
  .badge.user     { background: rgba(96,165,250,0.1);  color: var(--blue); border: 1px solid rgba(96,165,250,0.2); }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .badge.active .badge-dot { animation: pulse 1.5s ease infinite; }
 
  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
    border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.18s; border: 1px solid transparent; outline: none;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #d44068; }
  .btn-ghost { background: var(--surface2); color: var(--text); border-color: var(--border); }
  .btn-ghost:hover { background: var(--border); }
  .btn-resolve {
    background: rgba(52,211,153,0.1); color: var(--green);
    border: 1px solid rgba(52,211,153,0.25); padding: 5px 12px; font-size: 12px;
  }
  .btn-resolve:hover { background: rgba(52,211,153,0.2); }
  .btn-resolve:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-icon { padding: 7px; border-radius: 8px; background: var(--surface2); border: 1px solid var(--border); cursor: pointer; color: var(--muted); display: inline-flex; transition: all 0.18s; }
  .btn-icon:hover { color: var(--text); border-color: var(--border2); }
 
  /* ── PAGINATION ── */
  .pagination {
    padding: 14px 18px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .pagination span { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .page-btns { display: flex; gap: 4px; }
  .page-btn {
    width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border);
    background: var(--surface2); color: var(--text); font-size: 12px; cursor: pointer;
    font-family: 'DM Mono', monospace; display: grid; place-items: center; transition: all 0.15s;
  }
  .page-btn:hover { border-color: var(--border2); }
  .page-btn.active { background: var(--accent); border-color: var(--accent); color: white; }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
 
  /* ── EMPTY ── */
  .empty { padding: 48px; text-align: center; color: var(--muted); }
  .empty .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
  .empty p { font-size: 13px; }
 
  /* ── SKELETON ── */
  .skeleton { background: var(--surface2); border-radius: 6px; animation: shimmer 1.4s ease infinite; }
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; } 50% { opacity: 1; }
  }
  .skeleton-row { display: flex; gap: 10px; padding: 13px 16px; border-bottom: 1px solid var(--border); }
  .skeleton-row:last-child { border: none; }
 
  /* ── LOGIN ── */
  .login-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg);
    background-image: radial-gradient(ellipse at 20% 40%, rgba(232,85,122,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 70%, rgba(96,165,250,0.04) 0%, transparent 50%);
  }
  .login-card {
    width: 380px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 40px; animation: fadeUp 0.5s ease both;
  }
  .login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .login-logo .shield-icon { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), #a8285e); display: grid; place-items: center; font-size: 20px; color: white; box-shadow: var(--glow); }
  .login-logo h1 { font-size: 20px; font-weight: 800; }
  .login-logo small { display: block; font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1.5px; }
  .login-form { display: flex; flex-direction: column; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group label { font-size: 11.5px; font-family: 'DM Mono', monospace; letter-spacing: 1px; color: var(--muted); text-transform: uppercase; }
  .form-input {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 14px; color: var(--text); font-family: 'Syne', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.18s;
  }
  .form-input:focus { border-color: var(--accent); }
  .error-msg { font-size: 12px; color: var(--red); padding: 8px 12px; background: rgba(248,113,113,0.07); border-radius: 6px; border: 1px solid rgba(248,113,113,0.2); }
  .login-footer { margin-top: 16px; font-size: 11px; color: var(--muted); text-align: center; font-family: 'DM Mono', monospace; }
 
  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2); border-radius: 14px;
    width: 100%; max-width: 460px; padding: 28px; animation: scaleIn 0.2s ease;
    max-height: 90vh; overflow-y: auto;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-header h3 { font-size: 16px; font-weight: 700; }
  .detail-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); gap: 12px; }
  .detail-row:last-child { border: none; }
  .detail-label { font-size: 11px; font-family: 'DM Mono', monospace; color: var(--muted); letter-spacing: 1px; flex-shrink: 0; }
  .detail-val { font-size: 13px; text-align: right; word-break: break-all; }
 
  /* ── TOAST ── */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 300; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
    border: 1px solid; display: flex; align-items: center; gap: 8px;
    animation: slideIn 0.3s ease; min-width: 220px;
  }
  .toast.success { background: rgba(52,211,153,0.1); color: var(--green); border-color: rgba(52,211,153,0.25); }
  .toast.error   { background: rgba(248,113,113,0.1); color: var(--red); border-color: rgba(248,113,113,0.25); }
 
  /* ── LIVE DOT ── */
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); display: inline-block; animation: pulse 1.5s ease infinite; }
 
  /* ── ANIMATIONS ── */
  @keyframes fadeUp   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn  { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideIn  { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse    { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; } 70% { opacity: 0.7; box-shadow: 0 0 0 5px transparent; } }
 
  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .sidebar { width: 60px; }
    .sidebar-logo span, .sidebar-logo small, .nav-item span { display: none; }
    .nav-item { justify-content: center; }
    .main { margin-left: 60px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .page { padding: 16px; }
    .topbar { padding: 12px 16px; }
  }
`;
 
// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastId = 0;
function ToastContainer({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          {t.type === "success" ? <Icon.Check /> : <Icon.Alert />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
 
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = toastId++;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}
 
// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const submit = async () => {
    if (!email || !password) return setError("Please enter email and password.");
    setLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.data?.role !== "admin") throw new Error("Not authorized as admin.");
      localStorage.setItem("adminToken", data.data?.token || data.token);
      onLogin(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="shield-icon"><Icon.Shield /></div>
          <div>
            <h1>Shield Her</h1>
            <small>ADMIN PANEL</small>
          </div>
        </div>
        <div className="login-form">
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" placeholder="admin@shieldher.app" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{marginTop:4}}>
            {loading ? "Signing in…" : "Sign In as Admin"}
          </button>
        </div>
        <div className="login-footer">
          <span className="live-dot" style={{marginRight:6}}></span>
          Shield Her Safety Platform
        </div>
      </div>
    </div>
  );
}
 
// ─── SKELETON ─────────────────────────────────────────────────────────────────
function TableSkeleton({ cols = 5, rows = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}><div className="skeleton" style={{ height: 14, width: `${60 + Math.random() * 30}%` }} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
 
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const load = async () => {
    setLoading(true);
    try { const d = await apiFetch("/dashboard"); setStats(d.data || d); }
    catch { }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
 
  const cards = stats ? [
    { label: "Total Users",    value: stats.totalUsers,    icon: <Icon.Users />,   color: "blue" },
    { label: "Total SOS",      value: stats.totalSOS,      icon: <Icon.Alert />,   color: "red" },
    { label: "Active SOS",     value: stats.activeSOS,     icon: <Icon.Alert />,   color: "amber" },
    { label: "Total Journeys", value: stats.totalJourneys, icon: <Icon.Journey />, color: "green" },
    { label: "Active Zones",   value: stats.totalZones,    icon: <Icon.Zone />,    color: "pink" },
  ] : [];
 
  return (
    <div className="page">
      <div className="section-header">
        <h2>Overview</h2>
        <button className="btn-icon" onClick={load} title="Refresh"><Icon.Refresh /></button>
      </div>
 
      <div className="stats-grid">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 36, width: 60 }} />
              </div>
            ))
          : cards.map(c => (
              <div key={c.label} className={`stat-card ${c.color}`}>
                <div className="label">{c.label}</div>
                <div className="value">{c.value ?? "—"}</div>
                <div className="icon-wrap">{c.icon}</div>
              </div>
            ))}
      </div>
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="table-wrap" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--muted)", letterSpacing: "1.5px", marginBottom: 14 }}>SYSTEM STATUS</p>
          {[
            { label: "Backend API",     val: "Operational", ok: true },
            { label: "Auth Service",    val: "Operational", ok: true },
            { label: "SOS Engine",      val: "Live",        ok: true },
            { label: "Journey Tracker", val: "Active",      ok: true },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>{s.label}</span>
              <span style={{ color: s.ok ? "var(--green)" : "var(--red)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>
                {s.ok && <span className="live-dot" style={{ marginRight: 6, background: "var(--green)" }}></span>}
                {s.val}
              </span>
            </div>
          ))}
        </div>
 
        <div className="table-wrap" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "var(--muted)", letterSpacing: "1.5px", marginBottom: 14 }}>QUICK STATS</p>
          {stats && [
            { label: "SOS Resolution Rate", val: stats.totalSOS ? `${Math.round(((stats.totalSOS - stats.activeSOS) / stats.totalSOS) * 100)}%` : "N/A" },
            { label: "Active SOS Rate",     val: stats.totalSOS ? `${Math.round((stats.activeSOS / stats.totalSOS) * 100)}%` : "N/A" },
            { label: "Journeys / User",     val: stats.totalUsers ? (stats.totalJourneys / stats.totalUsers).toFixed(1) : "N/A" },
            { label: "Safe Zones Active",   val: stats.totalZones ?? "—" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>{s.label}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "var(--text)" }}>{s.val}</span>
            </div>
          ))}
          {!stats && <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />}
        </div>
      </div>
    </div>
  );
}
 
// ─── USERS ────────────────────────────────────────────────────────────────────
function UsersPage({ toast }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const limit = 15;
 
  const load = async (p = page) => {
    setLoading(true);
    try {
      const d = await apiFetch(`/users?page=${p}&limit=${limit}`);
      setUsers(d.data || []);
      setTotal(d.total || 0);
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  };
 
  useEffect(() => { load(page); }, [page]);
 
  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );
 
  const totalPages = Math.ceil(total / limit);
 
  return (
    <div className="page">
      <div className="section-header">
        <h2>Users <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>({total})</span></h2>
        <button className="btn-icon" onClick={() => load(page)}><Icon.Refresh /></button>
      </div>
 
      <div className="table-wrap">
        <div className="table-toolbar">
          <input className="search-box" placeholder="Search by name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>
            {filtered.length} shown
          </span>
        </div>
        <table>
          <thead><tr>
            <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th>
          </tr></thead>
          {loading ? <TableSkeleton cols={7} /> : (
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty"><div className="empty-icon"><Icon.Users /></div><p>No users found.</p></div>
                </td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u._id}>
                  <td style={{ color: "var(--muted)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{u.name || "—"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{u.email}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{u.phone || "—"}</td>
                  <td><span className="badge user">{u.role || "user"}</span></td>
                  <td style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(u)}><Icon.Eye /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span>Page {page} of {totalPages} · {total} total</span>
            <div className="page-btns">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          </div>
        )}
      </div>
 
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="btn-icon" onClick={() => setSelected(null)}><Icon.Close /></button>
            </div>
            {[
              ["Name",    selected.name],
              ["Email",   selected.email],
              ["Phone",   selected.phone],
              ["Role",    selected.role],
              ["User ID", selected._id],
              ["Joined",  selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"],
            ].map(([l, v]) => (
              <div key={l} className="detail-row">
                <span className="detail-label">{l}</span>
                <span className="detail-val">{v || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── SOS ─────────────────────────────────────────────────────────────────────
function SOSPage({ toast }) {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [resolving, setResolving] = useState(null);
  const [selected, setSelected] = useState(null);
  const limit = 15;
 
  const load = async (p = page, s = status) => {
    setLoading(true);
    try {
      const q = s ? `&status=${s}` : "";
      const d = await apiFetch(`/sos?page=${p}&limit=${limit}${q}`);
      setList(d.data || []);
      setTotal(d.total || 0);
    } catch (e) { toast(e.message, "error"); }
    setLoading(false);
  };
 
  useEffect(() => { load(page, status); }, [page, status]);
 
  const resolve = async (sosId) => {
    setResolving(sosId);
    try {
      await apiFetch(`/sos/${sosId}/resolve`, { method: "PATCH" });
      toast("SOS resolved successfully.", "success");
      setList(prev => prev.map(s => s._id === sosId ? { ...s, status: "resolved" } : s));
    } catch (e) { toast(e.message, "error"); }
    setResolving(null);
  };
 
  const totalPages = Math.ceil(total / limit);
 
  const handleStatusChange = (val) => { setStatus(val); setPage(1); };
 
  return (
    <div className="page">
      <div className="section-header">
        <h2>
          SOS Alerts <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>({total})</span>
          {list.some(s => s.status === "active") && <span className="live-dot" style={{ marginLeft: 10 }}></span>}
        </h2>
        <button className="btn-icon" onClick={() => load(page, status)}><Icon.Refresh /></button>
      </div>
 
      <div className="table-wrap">
        <div className="table-toolbar">
          <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon.Filter /> Filter:
          </span>
          <select className="filter-select" value={status} onChange={e => handleStatusChange(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <table>
          <thead><tr>
            <th>#</th><th>User</th><th>Email</th><th>Phone</th><th>Status</th><th>Triggered</th><th>Actions</th>
          </tr></thead>
          {loading ? <TableSkeleton cols={7} /> : (
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty"><div className="empty-icon"><Icon.Alert /></div><p>No SOS records found.</p></div>
                </td></tr>
              ) : list.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: "var(--muted)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{(page - 1) * limit + i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.user?.name || "Unknown"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{s.user?.email || "—"}</td>
                  <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 12 }}>{s.user?.phone || "—"}</td>
                  <td>
                    <span className={`badge ${s.status}`}>
                      <span className="badge-dot"></span>{s.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Mono',monospace" }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}><Icon.Eye /></button>
                    {s.status !== "resolved" && (
                      <button
                        className="btn btn-resolve"
                        disabled={resolving === s._id}
                        onClick={() => resolve(s._id)}
                      >
                        {resolving === s._id ? "…" : <><Icon.Check /> Resolve</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <span>Page {page} of {totalPages} · {total} total</span>
            <div className="page-btns">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn ${n === page ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          </div>
        )}
      </div>
 
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>SOS Details</h3>
              <button className="btn-icon" onClick={() => setSelected(null)}><Icon.Close /></button>
            </div>
            {[
              ["SOS ID",      selected._id],
              ["User Name",   selected.user?.name],
              ["User Email",  selected.user?.email],
              ["Phone",       selected.user?.phone],
              ["Status",      selected.status],
              ["Triggered",   selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"],
              ["Resolved At", selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleString() : "—"],
              ["Resolved By", selected.resolvedBy],
              ["Location Lat",selected.location?.coordinates?.[1]],
              ["Location Lng",selected.location?.coordinates?.[0]],
            ].map(([l, v]) => (
              <div key={l} className="detail-row">
                <span className="detail-label">{l}</span>
                <span className="detail-val">{v || "—"}</span>
              </div>
            ))}
            {selected.status !== "resolved" && (
              <button
                className="btn btn-resolve"
                style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
                disabled={resolving === selected._id}
                onClick={() => { resolve(selected._id); setSelected(null); }}
              >
                <Icon.Check /> Mark as Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("adminToken");
    return t ? { token: t } : null;
  });
  const [tab, setTab] = useState("dashboard");
  const { toasts, add: toast, remove: removeToast } = useToast();
 
  const logout = () => {
    localStorage.removeItem("adminToken");
    setUser(null);
  };
 
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Icon.Dashboard /> },
    { id: "users",     label: "Users",     icon: <Icon.Users /> },
    { id: "sos",       label: "SOS Alerts",icon: <Icon.Alert /> },
  ];
 
  if (!user) return (
    <>
      <style>{css}</style>
      <LoginPage onLogin={setUser} />
    </>
  );
 
  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="shield-icon"><Icon.Shield /></div>
            <div>
              <span>Shield Her</span>
              <small>ADMIN</small>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <span className="icon">{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={logout}>
              <Icon.Logout /><span>Logout</span>
            </button>
          </div>
        </aside>
 
        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            <h1>{navItems.find(n => n.id === tab)?.label}</h1>
            <div className="topbar-right">
              <span className="live-dot"></span>
              <span className="admin-badge">ADMIN</span>
            </div>
          </div>
 
          {tab === "dashboard" && <Dashboard />}
          {tab === "users"     && <UsersPage toast={toast} />}
          {tab === "sos"       && <SOSPage toast={toast} />}
        </main>
      </div>
 
      <ToastContainer toasts={toasts} remove={removeToast} />
    </>
  );
}