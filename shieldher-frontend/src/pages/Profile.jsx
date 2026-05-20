// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";
import { PageWrapper, AlertBanner } from "../components/UI";

// ─── API helper (uses your existing auth token from context/localStorage) ────
const api = async (method, path, body) => {
  const token = localStorage.getItem("accessToken"); // adjust key if needed
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Something went wrong.");
  return data;
};

// ─── ContactCard ─────────────────────────────────────────────────────────────
const ContactCard = ({ name, phone, email, relationship, onRemove, removing }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-shield-border last:border-0">
    <div className="w-10 h-10 rounded-full bg-shield-pink/20 flex items-center justify-center text-lg font-bold text-shield-pink">
      {name?.[0]?.toUpperCase() || "?"}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-display font-semibold">{name}</p>
      <p className="text-shield-muted text-xs font-mono">
        {phone} · {relationship || "Guardian"}
      </p>
      {email && (
        <p className="text-shield-muted text-xs font-mono truncate">{email}</p>
      )}
    </div>
    <button
      onClick={onRemove}
      disabled={removing}
      className="text-shield-muted hover:text-red-400 transition-colors text-sm disabled:opacity-40"
    >
      {removing ? "..." : "🗑"}
    </button>
  </div>
);

// ─── Profile Page ─────────────────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState("contacts");

  // contacts state
  const [contacts, setContacts]       = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [adding, setAdding]           = useState(false);
  const [saving, setSaving]           = useState(false);
  const [removingId, setRemovingId]   = useState(null);
  const [newContact, setNewContact]   = useState({ name: "", phone: "", email: "", relationship: "" });

  // feedback
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 3500); }
    else                    { setError(msg);   setTimeout(() => setError(""),   4000); }
  };

  // ── fetch contacts on mount ──────────────────────────────────────────────
  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await api("GET", "/contacts");
      setContacts(res.data || []);
    } catch (e) {
      flash("error", e.message);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // ── add contact ──────────────────────────────────────────────────────────
  const addContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.email) {
      flash("error", "Name, phone and email are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await api("POST", "/contacts", {
        name:         newContact.name.trim(),
        phone:        newContact.phone.trim(),
        email:        newContact.email.trim(),
        relationship: newContact.relationship.trim() || "Guardian",
      });
      setContacts((prev) => [...prev, res.data]);
      setNewContact({ name: "", phone: "", email: "", relationship: "" });
      setAdding(false);
      flash("success", "Trusted contact added!");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── remove contact ───────────────────────────────────────────────────────
  const removeContact = async (id) => {
    setRemovingId(id);
    try {
      await api("DELETE", `/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      flash("success", "Contact removed.");
    } catch (e) {
      flash("error", e.message);
    } finally {
      setRemovingId(null);
    }
  };

  const setField = (field) => (e) =>
    setNewContact((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // ─── Settings toggles (local only — no backend for these settings yet) ──
  const [settings, setSettings] = useState({
    shakeToSOS:      true,
    voiceTrigger:    false,
    journeyAutoAlert: true,
    heatmapWarnings: true,
    evidenceLocker:  true,
  });
  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const settingsList = [
    { key: "shakeToSOS",       icon: "📳", label: "Shake to SOS",       sub: "Triple-shake activates SOS" },
    { key: "voiceTrigger",     icon: "🎙", label: "Voice Trigger",       sub: '"Call mom" activates SOS' },
    { key: "journeyAutoAlert", icon: "🧭", label: "Journey Auto-Alert",  sub: "Alert if you deviate from route" },
    { key: "heatmapWarnings",  icon: "🗺", label: "Heatmap Warnings",   sub: "Warn when entering danger zones" },
    { key: "evidenceLocker",   icon: "📹", label: "Evidence Locker",    sub: "Auto-record during SOS events" },
  ];

  const [keyword, setKeyword] = useState("call mom");

  return (
    <PageWrapper>
      <div className="min-h-screen pb-24 page-enter">

        {/* Header */}
        <header className="px-4 pt-12 pb-6">
          <h1 className="text-2xl font-display font-bold text-gradient">Profile</h1>
        </header>

        <div className="px-4 space-y-4">

          {/* Banners */}
          {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}
          {error   && <AlertBanner type="error"   message={error}   onClose={() => setError("")}   />}

          {/* User card */}
          <div className="card p-5 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-shield-pink to-shield-pink-dim flex items-center justify-center text-2xl font-display font-bold text-white shadow-pink">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-shield-success rounded-full border-2 border-shield-card" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-display font-bold text-lg truncate">{user?.name || "User"}</p>
              <p className="text-shield-muted text-xs font-mono truncate">{user?.email}</p>
              <p className="text-shield-muted text-xs font-mono">{user?.phone}</p>
            </div>
            <div className="status-badge bg-shield-success/10 text-shield-success border border-shield-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-shield-success inline-block mr-1" />
              Protected
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-shield-surface rounded-xl p-1">
            {["contacts", "settings"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold capitalize transition-all
                  ${tab === t ? "bg-zinc-900 text-shield-pink shadow-sm" : "text-shield-muted hover:text-white"}`}
              >
                {t === "contacts" ? "👥 Trusted Contacts" : "⚙️ Settings"}
              </button>
            ))}
          </div>

          {/* ── CONTACTS TAB ─────────────────────────────────────────── */}
          {tab === "contacts" && (
            <>
              <div className="card overflow-hidden">
                {loadingContacts ? (
                  <p className="text-center text-shield-muted text-sm font-body py-6">Loading contacts…</p>
                ) : contacts.length === 0 ? (
                  <p className="text-center text-shield-muted text-sm font-body py-6">No trusted contacts yet.</p>
                ) : (
                  contacts.map((c) => (
                    <ContactCard
                      key={c._id}
                      name={c.name}
                      phone={c.phone}
                      email={c.email}
                      relationship={c.relationship}
                      removing={removingId === c._id}
                      onRemove={() => removeContact(c._id)}
                    />
                  ))
                )}
              </div>

              {/* contact count hint */}
              {contacts.length > 0 && (
                <p className="text-xs text-shield-muted text-center font-mono">
                  {contacts.length}/5 trusted contacts
                </p>
              )}

              {/* Add button / form */}
              {contacts.length < 5 && (
                !adding ? (
                  <button onClick={() => setAdding(true)} className="btn-primary w-full">
                    + Add Trusted Contact
                  </button>
                ) : (
                  <div className="card p-5 space-y-4 animate-slide-up">
                    <p className="font-display font-semibold text-white">New Trusted Contact</p>

                    <input
                      className="input-field"
                      placeholder="Name *"
                      value={newContact.name}
                      onChange={setField("name")}
                    />
                    <input
                      className="input-field"
                      placeholder="Phone *"
                      value={newContact.phone}
                      onChange={setField("phone")}
                      type="tel"
                    />
                    <input
                      className="input-field"
                      placeholder="Email *"
                      value={newContact.email}
                      onChange={setField("email")}
                      type="email"
                    />
                    <input
                      className="input-field"
                      placeholder="Relationship (e.g. Mother)"
                      value={newContact.relationship}
                      onChange={setField("relationship")}
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setAdding(false); setNewContact({ name: "", phone: "", email: "", relationship: "" }); }}
                        className="btn-ghost flex-1"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addContact}
                        disabled={saving || !newContact.name || !newContact.phone || !newContact.email}
                        className="btn-primary flex-1"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                )
              )}

              {contacts.length >= 5 && (
                <p className="text-xs text-shield-muted text-center font-mono py-1">
                  Maximum 5 trusted contacts reached.
                </p>
              )}
            </>
          )}

          {/* ── SETTINGS TAB ─────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="space-y-3">
              {settingsList.map(({ key, icon, label, sub }) => (
                <div key={key} className="card p-4 flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-display font-semibold">{label}</p>
                    <p className="text-shield-muted text-xs font-body">{sub}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(key)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                      ${settings[key] ? "bg-shield-pink" : "bg-shield-border"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
                        ${settings[key] ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>
              ))}

              {/* Voice keyword */}
              <div className="card p-4 space-y-2">
                <p className="text-white text-sm font-display font-semibold">🗝 Voice Keyword</p>
                <p className="text-shield-muted text-xs font-body">Your secret phrase to trigger SOS via voice</p>
                <input
                  className="input-field font-mono text-sm"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter your secret phrase"
                />
                <button className="text-xs text-shield-pink font-display hover:text-shield-rose transition-colors">
                  Save Keyword
                </button>
              </div>

              {/* Account / logout */}
              <div className="card p-4 space-y-3 border-red-900/50">
                <p className="text-xs font-display font-semibold text-red-400 uppercase tracking-widest">Account</p>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-red-800 text-red-400 text-sm font-display font-semibold
                             hover:bg-red-950/50 transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <BottomNav />
    </PageWrapper>
  );
};

export default Profile;