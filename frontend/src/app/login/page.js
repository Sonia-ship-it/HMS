"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { authApi, setToken, setUser, getStoredUser } from "@/lib/api";

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__redirecting_to_login = false;
    }
    
    const user = getStoredUser();
    if (user && user.token) {
      setIsRedirecting(true);
      window.location.href = "/dashboard";
    }
  }, []);

  if (isRedirecting) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="spinner" />
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(form.identifier, form.password);
      setToken(response.token);
      setUser(response);
      
      setIsRedirecting(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-modern">
      <div className="auth-modern-left">
        <div className="auth-modern-illustration">
          <Image 
            src="/img1.png" 
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
            <h1>Please Login</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group-modern">
              <label className="form-label-modern">Email or Username</label>
              <input
                type="text"
                className="input-modern"
                placeholder="Enter your email or username"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-modern"
                  placeholder="Enter your password"
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

            <div className="auth-modern-forgot">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-modern btn-modern-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-modern-footer">
            Don't have an account? <Link href="/register">Register now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
