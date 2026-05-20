// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldLogo, InputField, PasswordInput, AlertBanner, Spinner, PageWrapper } from "../components/UI";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const [form,   setForm]   = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email.";
    if (!form.password)                    e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    // 1. AuthContext ke throug login hit karo
    const res = await login({ email: form.email, password: form.password });
    
    // 2. Dynamic Redirection Check based on Server Response Role
    if (res.success) {
      // Tumhara backend data structure: response.data.user.role
      const userRole = res.data?.user?.role; 

      if (userRole === "admin") {
        console.log("Admin connection verified. Landing on Admin Workspace.");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("Standard user session initialized.");
        navigate("/dashboard", { replace: true });
      }
    } else if (res.message?.includes("verify")) {
      navigate("/verify-otp", { state: { email: form.email } });
    }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 page-enter">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-shield-pink opacity-20 rounded-full scale-150" />
                <ShieldLogo size={52} />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-gradient">Welcome Back</h1>
            <p className="text-shield-muted font-body text-sm">Sign in to your safety shield</p>
          </div>

          {/* Card */}
          <div className="card p-8 space-y-5">
            {error && <AlertBanner type="error" message={error} onClose={clearError} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email"
                icon="📧"
                type="email"
                placeholder="priya@example.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                autoComplete="email"
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                autoComplete="current-password"
              />

              <div className="flex justify-end">
                <button type="button" className="text-xs text-shield-pink hover:text-shield-rose font-body transition-colors">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Spinner /> Signing in…</> : "Sign In →"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-shield-border" />
              <span className="text-shield-muted text-xs font-body">new here?</span>
              <div className="flex-1 h-px bg-shield-border" />
            </div>

            <Link to="/register" className="btn-ghost w-full flex items-center justify-center">
              Create Account
            </Link>
          </div>

          {/* Emergency note */}
          <div className="card p-4 border-shield-pink/30 bg-shield-pink/5">
            <p className="text-center text-xs font-body text-shield-rose">
              🛡️ In an emergency, <strong>triple-shake</strong> your phone to trigger SOS — even without logging in.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;