"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { authApi, setToken, setUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    identifier: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!form.identifier.trim()) {
      setError("Username or Email is required");
      return;
    }

    setLoading(true);

    try {
      const isEmail = form.identifier.includes("@");
      
      const response = await authApi.register({
        name: form.name,
        email: isEmail ? form.identifier : `${form.identifier}@temp.local`,
        username: isEmail ? form.identifier.split("@")[0] : form.identifier,
        phone: form.phone,
        password: form.password,
      });
      setToken(response.token);
      setUser(response);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modern">
      <div className="auth-modern-left">
        <div className="auth-modern-illustration">
          <Image 
            src="/img2.png" 
            alt="Healthcare illustration" 
            width={500} 
            height={500}
            priority
            style={{ width: '100%', height: 'auto', maxWidth: '500px' }}
          />
        </div>
      </div>

      <div className="auth-modern-right">
        <div className="auth-modern-form">
          <div className="auth-modern-header">
            <h1>Create Account</h1>
            <p>Sign up to get started with SmartHMS</p>
          </div>

          <form onSubmit={handleRegister}>
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group-modern">
              <label className="form-label-modern">Full Name</label>
              <input
                type="text"
                className="input-modern"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Username or Email</label>
              <input
                type="text"
                className="input-modern"
                placeholder="Enter username or email"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
              />
              <small className="input-hint">
                This will be your unique login identifier and cannot be changed
              </small>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Phone</label>
              <input
                type="tel"
                className="input-modern"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-modern"
                  placeholder="Create a password (min 6 characters)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: 'var(--fg-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-modern"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: 'var(--fg-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-modern btn-modern-primary" disabled={loading}>
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="auth-modern-footer">
            Already have an account? <Link href="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
