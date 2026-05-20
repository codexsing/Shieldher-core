import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";
import { PageWrapper } from "../components/UI";
 
const api = async (method, path, body) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed.");
  return data;
};
 
const getPosition = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    })
  );
 
// ─── Auto Evidence Capture ────────────────────────────────────────────────────
// SOS trigger hone ke baad 30 seconds ka video+audio record karta hai
// aur /api/evidence/upload pe POST karta hai (multipart/form-data)
const captureEvidence = async (
  sosId,
  coords
) => {

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });

    const video =
      document.createElement("video");

    video.srcObject = stream;

    await video.play();

    // wait camera ready
    await new Promise((r) =>
      setTimeout(r, 1000)
    );

    const canvas =
      document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx =
      canvas.getContext("2d");

    ctx.drawImage(
      video,
      0,
      0
    );

    // stop camera
    stream.getTracks().forEach((t) =>
      t.stop()
    );

    const blob =
      await new Promise((resolve) =>
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.8
        )
      );

    const formData =
      new FormData();

    formData.append(
      "file",
      blob,
      `evidence_${Date.now()}.jpg`
    );

    formData.append("sosId", sosId);

    if (coords?.lat) {
      formData.append(
        "lat",
        coords.lat
      );
    }

    if (coords?.lng) {
      formData.append(
        "lng",
        coords.lng
      );
    }

    const token =
      localStorage.getItem(
        "accessToken"
      );

    const res = await fetch(
      "/api/evidence/upload",
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

    const data =
      await res.json();

    console.log(
      "UPLOAD RESPONSE:",
      data
    );

    if (!res.ok) {
      throw new Error(
        data.message
      );
    }

    console.log(
      "✅ Image evidence uploaded"
    );

    return true;

  } catch (err) {

    console.error(
      "❌ Evidence failed:",
      err
    );

    return false;
  }
};
 
// ─── Fake Call Screen ─────────────────────────────────────────────────────────
const FakeCallScreen = ({ callerName, onEnd }) => {
  const [duration, setDuration] = useState(0);
 
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const ring = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    };
    ring();
    const interval = setInterval(ring, 2000);
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => { clearInterval(interval); clearInterval(timer); ctx.close(); };
  }, []);
 
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
 
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between py-16 px-6">
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
          {callerName?.[0]?.toUpperCase() || "M"}
        </div>
        <p className="text-white text-3xl font-bold tracking-tight">{callerName || "Mum"}</p>
        <p className="text-green-400 text-sm font-mono">{duration > 0 ? fmt(duration) : "Incoming call..."}</p>
        <p className="text-gray-500 text-xs">Mobile · India</p>
      </div>
      <div className="flex items-center justify-around w-full">
        <div className="flex flex-col items-center gap-2">
          <button onClick={onEnd} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <span className="text-2xl">📵</span>
          </button>
          <span className="text-gray-400 text-xs">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-xl">🔇</span>
          </button>
          <span className="text-gray-400 text-xs">Mute</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform animate-bounce">
            <span className="text-2xl">📞</span>
          </button>
          <span className="text-gray-400 text-xs">Accept</span>
        </div>
      </div>
    </div>
  );
};
 
// ─── Main SOS Page ────────────────────────────────────────────────────────────
const SOSPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const [sosActive, setSosActive]   = useState(false);
  const [sosId, setSosId]           = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [contactsAlerted, setContactsAlerted] = useState(0);
  const [error, setError]           = useState("");
  const [status, setStatus]         = useState("");
  const [coords, setCoords]         = useState(null);
 
  // Evidence capture state
  const [evidenceStatus, setEvidenceStatus] = useState(""); // "recording" | "uploaded" | "failed" | ""
  const evidenceRecorderRef = useRef(null);
 
  const locationInterval = useRef(null);
  const sosIdRef         = useRef(null);
 
  const shakeCount   = useRef(0);
  const lastShake    = useRef(0);
  const shakeTimeout = useRef(null);
  const evidenceIntervalRef = useRef(null);
 
  const [voiceActive, setVoiceActive] = useState(false);
  const [keyword, setKeyword]         = useState("call mom");
  const recognitionRef                = useRef(null);
  const voiceActiveRef                = useRef(false);
 
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [callerName, setCallerName]         = useState("Mum");
 
  const holdInterval                    = useRef(null);
  const [holdProgress, setHoldProgress] = useState(0);
 
  // ── On mount: check if SOS already active ──
  useEffect(() => {
    (async () => {
      try {
        const res = await api("GET", "/sos/active");
        if (res.data) {
          setSosActive(true);
          setSosId(res.data._id);
          sosIdRef.current = res.data._id;
          setStatus("SOS already active. Contacts are being updated.");
          startLocationTracking(res.data._id);
        }
      } catch (_) {}
    })();
    return () => stopLocationTracking();
  }, []);
 
  const startLocationTracking = useCallback((id) => {
    stopLocationTracking();
    const sendLocation = async () => {
      const currentId = sosIdRef.current || id;
      try {
        const pos = await getPosition();
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        await api("POST", `/sos/${currentId}/location`, { lat, lng });
      } catch (e) {
        console.error("Location error:", e.message);
      }
    };
    sendLocation();
    locationInterval.current = setInterval(sendLocation, 30000);
  }, []);
 
  const stopLocationTracking = () => {
    if (locationInterval.current) clearInterval(locationInterval.current);
  };
 
  // ── Trigger SOS + auto-capture evidence ──
  const triggerSOS = useCallback(async (triggerType = "button") => {
    if (sosActive || triggering) return;
    setTriggering(true);
    setError("");
 
    let lat = 0, lng = 0;
    try {
      const pos = await getPosition();
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      setCoords({ lat, lng });
    } catch (_) {
      setError("Location permission denied. SOS sent without GPS.");
    }
 
    try {
      const res = await api("POST", "/sos/trigger", { lat, lng, trigger: triggerType });
      const id  = res.data.sosId;
 
      setSosId(id);
      sosIdRef.current = id;
      setSosActive(true);
      setContactsAlerted(res.data.contactsAlerted || 0);
      setStatus(`SOS active! ${res.data.contactsAlerted} contact(s) alerted via SMS & email.`);
      startLocationTracking(id);
 
      // ── Evidence auto-capture start ──
      setEvidenceStatus("recording");
    
      // first capture immediately
const uploaded = await captureEvidence(
  id,
  { lat, lng }
);

if (uploaded) {
  setEvidenceStatus("uploaded");
} else {
  setEvidenceStatus("failed");
}

// every 30 sec capture
evidenceIntervalRef.current =
  setInterval(async () => {

    console.log(
      "📸 Auto capturing evidence..."
    );

    const currentCoords = coords;

    const success =
      await captureEvidence(
        id,
        currentCoords
      );

    if (success) {
      setEvidenceStatus("uploaded");
    } else {
      setEvidenceStatus("failed");
    }

  }, 30000);
 
    } catch (e) {
      setError(e.message);
    } finally {
      setTriggering(false);
    }
  }, [sosActive, triggering, startLocationTracking]);
 
  const cancelSOS = async () => {
    if (!sosIdRef.current || cancelling) return;
    setCancelling(true);
    // Evidence recording bhi rok do
    if (evidenceRecorderRef.current?.state !== "inactive") {
      evidenceRecorderRef.current?.stop();
    }
    try {
      await api("PATCH", `/sos/${sosIdRef.current}/cancel`);
      setSosActive(false);
      setSosId(null);
      sosIdRef.current = null;
      setContactsAlerted(0);
      setCoords(null);
      if (evidenceIntervalRef.current) {
  clearInterval(
    evidenceIntervalRef.current
  );
}
// stop auto evidence loop
if (evidenceIntervalRef.current) {

  clearInterval(
    evidenceIntervalRef.current
  );

  evidenceIntervalRef.current = null;

  console.log(
    "🛑 Evidence auto capture stopped"
  );
}
      setEvidenceStatus("");
      setStatus("SOS cancelled. You are safe.");
      stopLocationTracking();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelling(false);
    }
  };
 
  const resolveSOS = async () => {
    if (!sosIdRef.current) return;
    // Evidence recording bhi rok do
    if (evidenceRecorderRef.current?.state !== "inactive") {
      evidenceRecorderRef.current?.stop();
    }
    try {
      await api("PATCH", `/sos/${sosIdRef.current}/resolve`);
      setSosActive(false);
      setSosId(null);
      sosIdRef.current = null;
      setContactsAlerted(0);
      setCoords(null);
      if (evidenceIntervalRef.current) {
  clearInterval(
    evidenceIntervalRef.current
  );
}
// stop auto evidence loop
if (evidenceIntervalRef.current) {

  clearInterval(
    evidenceIntervalRef.current
  );

  evidenceIntervalRef.current = null;

  console.log(
    "🛑 Evidence auto capture stopped"
  );
}
      setEvidenceStatus("");
      setStatus("SOS resolved. Stay safe! 💚");
      stopLocationTracking();
    } catch (e) {
      setError(e.message);
    }
  };
 
  // ── Hold button logic ──
  const startHold = () => {
    if (sosActive) return;
    let progress = 0;
    holdInterval.current = setInterval(() => {
      progress += 4;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdInterval.current);
        setHoldProgress(0);
        triggerSOS("button");
      }
    }, 100);
  };
 
  const endHold = () => {
    clearInterval(holdInterval.current);
    setHoldProgress(0);
  };
 
  // ── Shake detection ──
  useEffect(() => {
    const handleMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      const magnitude = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);
      const now = Date.now();
      if (magnitude > 25 && now - lastShake.current > 300) {
        lastShake.current = now;
        shakeCount.current += 1;
        clearTimeout(shakeTimeout.current);
        shakeTimeout.current = setTimeout(() => { shakeCount.current = 0; }, 1500);
        if (shakeCount.current >= 3) { shakeCount.current = 0; triggerSOS("shake"); }
      }
    };
    if (typeof DeviceMotionEvent !== "undefined") {
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().then((r) => {
          if (r === "granted") window.addEventListener("devicemotion", handleMotion);
        }).catch(() => {});
      } else {
        window.addEventListener("devicemotion", handleMotion);
      }
    }
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [triggerSOS]);
 
  // ── Voice keyword detection ──
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice recognition not supported. Use Chrome browser.");
      return;
    }
    voiceActiveRef.current = true;
    setVoiceActive(true);
 
    const listen = () => {
      if (!voiceActiveRef.current) return;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-IN";
      rec.interimResults = false;
 
      rec.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript).join(" ").toLowerCase();
        if (transcript.includes(keyword.toLowerCase())) {
          voiceActiveRef.current = false;
          setVoiceActive(false);
          triggerSOS("voice");
        }
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed") {
          setError("Mic permission denied. Allow mic in browser settings.");
          voiceActiveRef.current = false;
          setVoiceActive(false);
          return;
        }
        setTimeout(listen, 300);
      };
      rec.onend = () => setTimeout(listen, 300);
      rec.start();
      recognitionRef.current = rec;
    };
    listen();
  };
 
  const stopVoice = () => {
    voiceActiveRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceActive(false);
  };
 
  useEffect(() => () => recognitionRef.current?.stop(), []);
 
  const mapsLink = coords ? `https://maps.google.com/?q=${coords.lat},${coords.lng}` : null;
 
  // Evidence badge helper
  const evidenceBadge = () => {
    if (evidenceStatus === "recording")
      return <span className="flex items-center gap-1 text-red-400 text-xs font-mono animate-pulse">🔴 Recording evidence...</span>;
    if (evidenceStatus === "uploaded")
      return <span className="flex items-center gap-1 text-shield-success text-xs font-mono">✅ Evidence saved (video)</span>;
    if (evidenceStatus === "failed")
      return <span className="flex items-center gap-1 text-yellow-400 text-xs font-mono">⚠️ Evidence capture failed (no camera permission)</span>;
    return null;
  };
 
  return (
    <PageWrapper>
      {fakeCallActive && <FakeCallScreen callerName={callerName} onEnd={() => setFakeCallActive(false)} />}
 
      <div className="min-h-screen pb-24 page-enter">
        <header className="px-4 pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-shield-muted hover:text-white transition-colors">←</button>
          <h1 className="text-2xl font-display font-bold text-gradient">SOS Center</h1>
          {sosActive && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" /> LIVE
            </span>
          )}
        </header>
 
        <div className="px-4 space-y-4">
          {error && (
            <div className="bg-red-950/60 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm font-body flex justify-between">
              {error}<button onClick={() => setError("")} className="text-red-500 ml-2">✕</button>
            </div>
          )}
          {status && (
            <div className="bg-shield-success/10 border border-shield-success/30 rounded-xl px-4 py-3 text-shield-success text-sm font-body flex justify-between">
              {status}<button onClick={() => setStatus("")} className="text-shield-success/50 ml-2">✕</button>
            </div>
          )}
 
          {/* ── Main SOS Button ── */}
          <div className="card p-6 flex flex-col items-center gap-5">
            {!sosActive ? (
              <>
                <p className="text-shield-muted text-xs font-display uppercase tracking-widest">Hold 3 seconds to activate</p>
                <div className="relative w-44 h-44">
                  <span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                  <span className="absolute inset-2 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="88" cy="88" r="80" fill="none" stroke="#2A2A3E" strokeWidth="6" />
                    <circle cx="88" cy="88" r="80" fill="none" stroke="#FF2D78" strokeWidth="6"
                      strokeLinecap="round" strokeDasharray={`${(holdProgress / 100) * 502} 502`} className="transition-all duration-100" />
                  </svg>
                  <button
                    onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                    onTouchStart={startHold} onTouchEnd={endHold} disabled={triggering}
                    className="absolute inset-3 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform select-none"
                    style={{ boxShadow: "0 0 40px rgba(255,45,120,0.4)" }}
                  >
                    <span className="text-4xl">🆘</span>
                    <span className="text-white text-xs font-display font-bold mt-1 uppercase tracking-widest">
                      {triggering ? "Sending..." : "SOS"}
                    </span>
                  </button>
                </div>
                <p className="text-shield-muted text-xs font-body text-center">Or triple-shake your phone · Say "{keyword}"</p>
              </>
            ) : (
              <>
                <div className="w-32 h-32 rounded-full bg-red-500/20 border-4 border-red-500 flex flex-col items-center justify-center animate-pulse">
                  <span className="text-3xl">🆘</span>
                  <span className="text-red-400 text-xs font-mono font-bold mt-1">ACTIVE</span>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-white font-display font-bold text-lg">SOS Active</p>
                  <p className="text-shield-muted text-xs font-body">{contactsAlerted} contact(s) alerted · GPS updating every 30s</p>
                  {coords && (
                    <a href={mapsLink} target="_blank" rel="noreferrer" className="text-shield-pink text-xs font-mono underline">
                      📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </a>
                  )}
                  {/* Evidence status badge */}
                  <div className="mt-1">{evidenceBadge()}</div>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={cancelSOS} disabled={cancelling}
                    className="flex-1 py-3 rounded-xl border border-red-800 text-red-400 text-sm font-display font-semibold hover:bg-red-950/40 transition-all active:scale-95">
                    {cancelling ? "Cancelling..." : "Cancel SOS"}
                  </button>
                  <button onClick={resolveSOS}
                    className="flex-1 py-3 rounded-xl bg-shield-success/20 border border-shield-success/40 text-shield-success text-sm font-display font-semibold hover:bg-shield-success/30 transition-all active:scale-95">
                    I'm Safe ✓
                  </button>
                </div>
              </>
            )}
          </div>
 
          {/* ── Shake to SOS ── */}
          <div className="card p-4 flex items-center gap-3">
            <span className="text-2xl">📳</span>
            <div className="flex-1">
              <p className="text-white text-sm font-display font-semibold">Shake to SOS</p>
              <p className="text-shield-muted text-xs font-body">Triple-shake fires SOS silently</p>
            </div>
            <span className="text-shield-success text-xs font-mono bg-shield-success/10 px-2 py-1 rounded-full border border-shield-success/20">Active</span>
          </div>
 
          {/* ── Voice Keyword ── */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎙</span>
              <div className="flex-1">
                <p className="text-white text-sm font-display font-semibold">Voice Keyword</p>
                <p className="text-shield-muted text-xs font-body">Say your keyword to silently trigger SOS</p>
              </div>
              <button onClick={voiceActive ? stopVoice : startVoice}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all
                  ${voiceActive ? "bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse"
                    : "bg-shield-surface border border-shield-border text-shield-muted hover:text-white"}`}>
                {voiceActive ? "🔴 Listening..." : "Start"}
              </button>
            </div>
            <input className="input-field w-full text-sm font-mono" value={keyword}
              onChange={(e) => setKeyword(e.target.value)} placeholder="Your secret keyword" />
            {voiceActive && (
              <p className="text-xs text-red-400 font-mono animate-pulse text-center">🎤 Listening for "{keyword}"...</p>
            )}
          </div>
 
          {/* ── Fake Call ── */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div className="flex-1">
                <p className="text-white text-sm font-display font-semibold">Fake Call Disguise</p>
                <p className="text-shield-muted text-xs font-body">Simulate an incoming call to escape a situation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input className="input-field flex-1 text-sm" value={callerName}
                onChange={(e) => setCallerName(e.target.value)} placeholder="Caller name (e.g. Mum)" />
              <button onClick={() => setFakeCallActive(true)} className="btn-primary px-4 text-sm whitespace-nowrap">
                Call Now
              </button>
            </div>
          </div>
 
          {/* ── Active SOS Info Panel ── */}
          {sosActive && (
            <div className="card p-4 space-y-2">
              <p className="text-xs font-display font-semibold text-shield-muted uppercase tracking-widest">What's happening</p>
              {[
                "📨 SMS + Email sent to all trusted contacts",
                "📍 Live GPS updating every 30 seconds",
                "🔴 Contacts can track your location in real-time",
                evidenceStatus === "recording"
                  ?"Auto-capturing image evidence every 30 seconds"
                  : evidenceStatus === "uploaded"
                  ? "🔒 Video evidence saved to your Evidence Locker"
                  : "🔒 Evidence locker recording if enabled",
              ].map((line) => <p key={line} className="text-shield-muted text-xs font-body">{line}</p>)}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </PageWrapper>
  );
};
 
export default SOSPage;
 