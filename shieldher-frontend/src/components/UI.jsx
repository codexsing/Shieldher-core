// src/components/UI.jsx
import React from "react";

// ── Shield Logo ───────────────────────────────────────────────────────────
export const ShieldLogo = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
    <path
      d="M20 3L5 9v12c0 8.3 6.4 16.1 15 18 8.6-1.9 15-9.7 15-18V9L20 3z"
      fill="url(#shieldGrad)"
      stroke="#FF2D78"
      strokeWidth="1.5"
    />
    <path
      d="M14 20l4 4 8-8"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="shieldGrad" x1="5" y1="3" x2="35" y2="39" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF2D78" stopOpacity="0.8" />
        <stop offset="1" stopColor="#C4215B" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  </svg>
);

// ── Spinner ───────────────────────────────────────────────────────────────
export const Spinner = ({ size = "sm" }) => {
  const s = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <svg className={`${s} animate-spin text-white`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
};

// ── Alert Banner ──────────────────────────────────────────────────────────
export const AlertBanner = ({ type = "error", message, onClose }) => {
  if (!message) return null;
  const styles = {
    error:   "bg-red-950/60 border-red-800 text-red-300",
    success: "bg-emerald-950/60 border-emerald-700 text-emerald-300",
    info:    "bg-blue-950/60 border-blue-800 text-blue-300",
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm font-body animate-fade-in ${styles[type]}`}>
      <span className="mt-0.5 flex-shrink-0">
        {type === "error" ? "⚠" : type === "success" ? "✓" : "ℹ"}
      </span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
      )}
    </div>
  );
};

// ── Input Field ───────────────────────────────────────────────────────────
export const InputField = ({ label, icon, error, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-shield-muted text-base">
          {icon}
        </span>
      )}
      <input
        className={`input-field ${icon ? "pl-10" : ""} ${error ? "border-red-600 focus:border-red-500" : ""}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400 font-body">{error}</p>}
  </div>
);

// ── Password Input ────────────────────────────────────────────────────────
export const PasswordInput = ({ label, error, ...props }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-shield-muted text-base">🔒</span>
        <input
          type={show ? "text" : "password"}
          className={`input-field pl-10 pr-12 ${error ? "border-red-600" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-shield-muted hover:text-white transition-colors text-sm"
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
    </div>
  );
};

// ── OTP Input ─────────────────────────────────────────────────────────────
export const OtpInput = ({ value, onChange, length = 6 }) => {
  const refs  = Array.from({ length }, () => React.createRef());
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (val && i < length - 1) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    refs[Math.min(pasted.length, length - 1)].current?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-mono font-semibold bg-zinc-900 border border-shield-border rounded-xl
                     text-white focus:outline-none focus:border-shield-pink focus:ring-1 focus:ring-shield-glow
                     transition-all duration-200"
        />
      ))}
    </div>
  );
};

// ── Page Wrapper ──────────────────────────────────────────────────────────
export const PageWrapper = ({ children, className = "" }) => (
  <div className={`min-h-screen bg-mesh noise-bg ${className}`}>
    <div className="relative z-10">{children}</div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, sub, color = "text-shield-pink" }) => (
  <div className="card p-4 flex items-center gap-4">
    <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-shield-surface`}>
      {icon}
    </div>
    <div>
      <p className="text-shield-muted text-xs font-display uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-display font-bold ${color}`}>{value}</p>
      {sub && <p className="text-shield-muted text-xs font-body mt-0.5">{sub}</p>}
    </div>
  </div>
);
