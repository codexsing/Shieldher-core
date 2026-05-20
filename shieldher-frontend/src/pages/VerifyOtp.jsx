// src/pages/VerifyOtp.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldLogo, OtpInput, AlertBanner, Spinner, PageWrapper } from "../components/UI";

const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || "";
  const { verifyOtp, resendOtp, loading, error, clearError } = useAuth();

  const [otp,       setOtp]       = useState("");
  const [success,   setSuccess]   = useState("");
  const [cooldown,  setCooldown]  = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    clearError();
    if (otp.length < 6) return;
    const res = await verifyOtp(email, otp);
    if (res.success) {
      setSuccess("Email verified! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    clearError();
    setSuccess("");
    const res = await resendOtp(email);
    if (res.success) {
      setSuccess("A new OTP has been sent to your email.");
      setCanResend(false);
      setCooldown(RESEND_COOLDOWN);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 page-enter">

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-shield-pink opacity-20 rounded-full scale-150" />
                <ShieldLogo size={52} />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-gradient">Verify Email</h1>
            <p className="text-shield-muted font-body text-sm">
              We sent a 6-digit code to<br />
              <span className="text-shield-rose font-medium">{email}</span>
            </p>
          </div>

          <div className="card p-8 space-y-6">
            {error   && <AlertBanner type="error"   message={error}   onClose={clearError} />}
            {success && <AlertBanner type="success" message={success} />}

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-display font-semibold text-shield-muted uppercase tracking-widest text-center">
                  Enter OTP
                </label>
                <OtpInput value={otp} onChange={setOtp} length={6} />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner /> Verifying…</> : "Verify & Continue →"}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center space-y-1">
              <p className="text-shield-muted text-xs font-body">Didn't receive the code?</p>
              {canResend ? (
                <button onClick={handleResend} className="text-shield-pink text-sm font-display font-semibold hover:text-shield-rose transition-colors">
                  Resend OTP
                </button>
              ) : (
                <p className="text-shield-muted text-xs font-mono">
                  Resend in <span className="text-shield-rose font-semibold">{cooldown}s</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-shield-border" />
              <span className="text-shield-muted text-xs font-body">wrong email?</span>
              <div className="flex-1 h-px bg-shield-border" />
            </div>

            <Link to="/register" className="btn-ghost w-full flex items-center justify-center text-sm">
              ← Back to Register
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default VerifyOtp;
