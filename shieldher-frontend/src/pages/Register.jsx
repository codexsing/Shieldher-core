// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldLogo, InputField, PasswordInput, AlertBanner, Spinner, PageWrapper } from "../components/UI";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name     = "Name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email))           e.email    = "Enter a valid email.";
    if (!/^\+?[0-9]{10,13}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid phone number.";
    if (form.password.length < 6)                   e.password = "Minimum 6 characters.";
    if (form.password !== form.confirm)             e.confirm  = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (res.success) navigate("/verify-otp", { state: { email: form.email } });
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
            <h1 className="text-3xl font-display font-bold text-gradient">ShieldHer</h1>
            <p className="text-shield-muted font-body text-sm">Create your safety account</p>
          </div>

          {/* Card */}
          <div className="card p-8 space-y-5">
            {error && <AlertBanner type="error" message={error} onClose={clearError} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                icon="👤"
                placeholder="Priya Sharma"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
                autoComplete="name"
              />
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
              <InputField
                label="Phone Number"
                icon="📱"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
                autoComplete="tel"
              />
              <PasswordInput
                label="Password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                autoComplete="new-password"
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set("confirm")}
                error={errors.confirm}
                autoComplete="new-password"
              />

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading ? <><Spinner /> Creating account…</> : "Create Account →"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-shield-border" />
              <span className="text-shield-muted text-xs font-body">already have an account?</span>
              <div className="flex-1 h-px bg-shield-border" />
            </div>

            <Link to="/login" className="btn-ghost w-full flex items-center justify-center">
              Sign In
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-center text-shield-muted text-xs font-body px-4">
            By registering, you agree to let ShieldHer protect you. Your data stays private and secure.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Register;
