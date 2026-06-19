"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      });
      
      setResetToken(response.resetToken);
      setUserEmail(response.email || "your registered email");
      setSuccess(`A verification code has been sent to ${response.email || 'your email'}. Please check your inbox.`);
      setStep(2);
    } catch (err) {
      setError(err.message || "User not found. Please check your email or username.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          resetToken,
          newPassword,
        }),
      });

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
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
            <h1>Reset Password</h1>
            <p>
              {step === 1 
                ? "Enter your email or username to reset your password" 
                : "Create a new password for your account"}
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestReset}>
              <div className="form-group-modern">
                <label className="form-label-modern">Email or Username</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                className="btn-modern btn-modern-primary" 
                disabled={loading}
              >
                {loading ? "Processing..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group-modern">
                <label className="form-label-modern">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-modern"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    minLength={6}
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
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
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

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button 
                  type="button"
                  className="btn-modern btn-modern-outline"
                  onClick={() => {
                    setStep(1);
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-modern btn-modern-primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <div className="auth-modern-footer">
            Remember your password? <Link href="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
