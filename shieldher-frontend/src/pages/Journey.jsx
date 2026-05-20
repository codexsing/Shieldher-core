// src/pages/Journey.jsx
import React, { useState } from "react";
import BottomNav from "../components/BottomNav";
import { PageWrapper, InputField, AlertBanner } from "../components/UI";

const Journey = () => {
  const [form, setForm]   = useState({ from: "", to: "", eta: "", notes: "" });
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const startJourney = () => {
    if (!form.from || !form.to || !form.eta) return;
    setActive(true);
    setChecked(false);
    setSuccess("Journey started! Contacts notified. We're watching over you. 🛡️");
    // In production: POST /api/journey/start
  };

  const checkIn = () => {
    setChecked(true);
    setSuccess("Check-in successful! Contacts notified you're safe ✅");
    // In production: POST /api/journey/checkin
  };

  const endJourney = () => {
    setActive(false);
    setChecked(false);
    setForm({ from: "", to: "", eta: "", notes: "" });
    setSuccess("Journey completed safely! 🎉");
    setTimeout(() => setSuccess(""), 4000);
  };

  const historyItems = [
    { from: "Home",    to: "College", date: "Today, 8:30 AM",  status: "safe",    duration: "45 min" },
    { from: "College", to: "Market",  date: "Yesterday, 6 PM", status: "safe",    duration: "20 min" },
    { from: "Market",  to: "Home",    date: "Yesterday, 7 PM", status: "delayed", duration: "55 min" },
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pb-24 page-enter">
        <header className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gradient">Journey Guardian</h1>
          <p className="text-shield-muted text-sm font-body mt-1">Share your route. Auto-alert if you deviate.</p>
        </header>

        <div className="px-4 space-y-4">
          {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

          {!active ? (
            /* Start Form */
            <div className="card p-5 space-y-4">
              <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">New Journey</p>

              <InputField label="From" icon="📍" placeholder="Starting location" value={form.from} onChange={set("from")} />
              <InputField label="To"   icon="🏁" placeholder="Destination"       value={form.to}   onChange={set("to")} />

              <div className="space-y-1.5">
                <label className="block text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">
                  Expected Arrival
                </label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={form.eta}
                  onChange={set("eta")}
                />
              </div>

              <InputField
                label="Notes (optional)"
                icon="📝"
                placeholder="e.g. taking bus route 47"
                value={form.notes}
                onChange={set("notes")}
              />

              <button
                onClick={startJourney}
                disabled={!form.from || !form.to || !form.eta}
                className="btn-primary w-full"
              >
                🧭 Start Journey
              </button>
            </div>
          ) : (
            /* Active Journey */
            <div className="space-y-4">
              {/* Status card */}
              <div className="card p-5 glow-border space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">Active Journey</p>
                  <span className="status-badge bg-shield-success/10 text-shield-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-shield-success animate-pulse" />
                    Live Tracking
                  </span>
                </div>

                {/* Route visual */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-shield-pink" />
                    <div className="w-0.5 h-10 bg-shield-border" />
                    <div className="w-3 h-3 rounded-full bg-shield-success" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-shield-muted text-xs font-body">From</p>
                      <p className="text-white font-display font-semibold">{form.from}</p>
                    </div>
                    <div>
                      <p className="text-shield-muted text-xs font-body">To</p>
                      <p className="text-white font-display font-semibold">{form.to}</p>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-shield-muted text-xs font-body">ETA</p>
                    <p className="text-shield-pink text-sm font-mono font-semibold">
                      {new Date(form.eta).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={checkIn}
                    disabled={checked}
                    className={`py-2.5 rounded-xl text-sm font-display font-semibold transition-all
                      ${checked
                        ? "bg-shield-success/20 text-shield-success border border-shield-success/30 cursor-default"
                        : "bg-shield-success/80 text-black hover:bg-shield-success active:scale-95"}`}
                  >
                    {checked ? "✅ Checked In" : "✅ Check In"}
                  </button>
                  <button onClick={endJourney} className="btn-ghost text-sm py-2.5">
                    🏁 End Journey
                  </button>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="card overflow-hidden">
                <div className="relative h-48 bg-shield-surface flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 to-shield-bg opacity-80" />
                  <div className="relative text-center space-y-2">
                    <p className="text-4xl">🗺️</p>
                    <p className="text-shield-muted text-sm font-body">Live map renders with Leaflet.js</p>
                    <p className="text-shield-muted text-xs font-mono">Connect Leaflet + OpenStreetMap</p>
                  </div>
                  {/* Fake GPS dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-shield-pink flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Journey History */}
          <div>
            <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest mb-3">Recent Journeys</p>
            <div className="card divide-y divide-shield-border">
              {historyItems.map((j) => (
                <div key={j.date} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{j.status === "safe" ? "✅" : "⚠️"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-body font-medium truncate">{j.from} → {j.to}</p>
                    <p className="text-shield-muted text-xs font-body">{j.date} · {j.duration}</p>
                  </div>
                  <span className={`status-badge text-xs ${
                    j.status === "safe"
                      ? "bg-shield-success/10 text-shield-success"
                      : "bg-shield-warning/10 text-shield-warning"
                  }`}>
                    {j.status === "safe" ? "Safe" : "Delayed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </PageWrapper>
  );
};

export default Journey;
