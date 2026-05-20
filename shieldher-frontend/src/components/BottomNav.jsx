import React from "react";
import { NavLink, useLocation } from "react-router-dom";
 
const NAV_ITEMS = [
  { to: "/dashboard", icon: "⌂",  label: "Home"    },
  { to: "/heatmap",   icon: "◎",  label: "Map"     },
  // center SOS — handled separately
  { to: "/evidence",  icon: "🔒", label: "Evidence" },
  { to: "/profile",   icon: "◉",  label: "Profile"  },
];
 
const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className="flex-1">
    {({ isActive }) => (
      <div className={`flex flex-col items-center gap-1 py-1 transition-all duration-200 ${isActive ? "" : ""}`}>
        {/* icon container */}
        <div className={`
          relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200
          ${isActive
            ? "bg-shield-pink/15"
            : "hover:bg-white/5"}
        `}>
          {isActive && (
            <div className="absolute inset-0 rounded-2xl bg-shield-pink/20 blur-sm" />
          )}
          <span
            className={`relative text-lg leading-none transition-all duration-200 ${
              isActive ? "scale-110" : "opacity-50"
            }`}
            style={isActive ? { filter: "drop-shadow(0 0 6px #ec4899)" } : {}}
          >
            {icon}
          </span>
        </div>
 
        {/* label */}
        <span
          className="font-display font-semibold tracking-wide transition-colors duration-200"
          style={{
            fontSize: "9px",
            color: isActive ? "#ec4899" : "rgba(255,255,255,0.35)",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
 
        {/* active dot */}
        {isActive && (
          <div className="w-1 h-1 rounded-full bg-shield-pink" style={{ marginTop: "-2px" }} />
        )}
      </div>
    )}
  </NavLink>
);
 
const SOSButton = () => {
  const location = useLocation();
  const isActive = location.pathname === "/sos";
 
  return (
    <NavLink to="/sos" className="flex-none flex flex-col items-center -mt-7 z-10">
      <div className="relative">
        {/* outer glow ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isActive ? "bg-red-500/30 blur-md scale-125" : "bg-shield-pink/20 blur-md scale-110"
        }`} />
 
        {/* pulse ring */}
        {!isActive && (
          <div className="absolute inset-0 rounded-full border-2 border-shield-pink/40 animate-ping" />
        )}
 
        {/* button */}
        <div className={`
          relative w-14 h-14 rounded-full flex items-center justify-center
          shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-200
          ${isActive
            ? "bg-red-600 scale-110 shadow-[0_0_24px_rgba(239,68,68,0.7)]"
            : "hover:scale-105 active:scale-95"}
        `}
          style={!isActive ? {
            background: "linear-gradient(135deg, #ec4899, #f43f5e)"
          } : {}}
        >
          <span className="text-xl leading-none">🆘</span>
        </div>
      </div>
 
      <span
        className="font-display font-bold tracking-wide mt-1.5"
        style={{
          fontSize: "9px",
          color: isActive ? "#f87171" : "#ec4899",
          letterSpacing: "0.1em",
        }}
      >
        SOS
      </span>
 
      {isActive && (
        <div className="w-1 h-1 rounded-full bg-red-400 mt-0.5" />
      )}
    </NavLink>
  );
};
 
const BottomNav = () => (
  <>
    {/* Blur backdrop extends full width */}
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "linear-gradient(to top, rgba(10,10,20,0.98) 0%, rgba(10,10,20,0.92) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="max-w-md mx-auto flex items-end justify-around px-6 pt-2 pb-3">
        <SOSButton />
        <NavItem to="/dashboard" icon="⌂" label="Home"    />
        <NavItem to="/heatmap"   icon="◎" label="Map"     />
        <NavItem to="/profile"   icon="◉" label="Profile" />
      </div>
    </div>
  </>
);
 
export default BottomNav;