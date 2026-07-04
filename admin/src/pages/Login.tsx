import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        setIsSuccess(true);
        await new Promise((r) => setTimeout(r, 800));
        navigate("/", { replace: true });
      } else {
        setIsLoading(false);
        setError("Access denied. Only admin accounts can log in here.");
      }
    } catch {
      setIsLoading(false);
      setError("Invalid email or password. Please try again.");
    }
  };


  return (
    <>
      {/* ── Global styles injected inline so we don't need a separate CSS file ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Inter', sans-serif; }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
          user-select: none;
        }

        .login-root {
          min-height: 100vh;
          background: #d1fae5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* Dot-grid background */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, #727783 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }

        /* Side imagery panel — desktop only */
        .side-panel {
          display: none;
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 30%;
          z-index: 0;
        }
        @media (min-width: 1024px) {
          .side-panel { display: block; }
        }
        .side-panel-img {
          width: 100%;
          height: 100%;
          background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDC81J2o7ePtOroCz_wooP5gL_4tnKFjW39UlHuUaf4fM2gQhV1AHBM2V3LrhlGr2f6YAMOW4ZEzhCS3XWlxRbfoTvJUM5y0mXQtEURLzGAHka5WX1nq0V615ldKviwUgL0xiilXCqgCgPCnQcYKH8TpFXIz-WaBXCcysrKCjSlg9QxUTWkTk8JW56LI5f4oE3Cv2Fc1rwK_ywKjCeLYabN-QVbY601-SprObwjqjXqtMnyHjZBTykO0zUAdkaJXrTaIw3coOK3zvV9');
          background-size: cover;
          background-position: center;
          opacity: 0.4;
          mix-blend-mode: multiply;
        }
        .side-panel-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, #d1fae5, transparent);
        }

        /* Card animation */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card-wrapper {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
          animation: fadeSlideUp 0.6s ease both;
        }

        /* Branding */
        .brand-icon-wrap {
          background: #059669;
          border-radius: 12px;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(5,150,105,0.25);
        }
        .brand-title {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
          letter-spacing: -0.02em;
          line-height: 40px;
          text-align: center;
        }
        .brand-sub {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #424752;
          text-align: center;
          margin-top: 4px;
        }

        /* Card */
        .login-card {
          background: #ffffff;
          border: 1px solid #c2c6d4;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(5,150,105,0.07);
        }
        .card-accent-bar {
          height: 4px;
          background: #059669;
          width: 100%;
        }
        .card-body {
          padding: 32px;
        }

        /* Form */
        .form-group { margin-bottom: 20px; }
        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 6px;
        }
        .field-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #424752;
          margin-left: 2px;
        }
        .forgot-link {
          font-size: 12px;
          font-weight: 600;
          color: #059669;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }

        .input-wrap {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #727783;
          font-size: 20px;
          transition: color 0.2s;
          pointer-events: none;
        }
        .input-wrap:focus-within .input-icon { color: #059669; }

        .field-input {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 44px;
          background: #f0fdf4;
          border: 1px solid #c2c6d4;
          border-radius: 8px;
          font-size: 14px;
          color: #111c2c;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .field-input::placeholder { color: rgba(114,119,131,0.7); }
        .field-input:focus {
          border-color: #059669;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(5,150,105,0.1);
        }
        .field-input.error-input { border-color: #ba1a1a; }
        .field-input.error-input:focus { box-shadow: 0 0 0 4px rgba(186,26,26,0.1); }

        .pw-input { padding-right: 48px; }
        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #727783;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .pw-toggle:hover { color: #111c2c; }

        /* Error message */
        .error-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffdad6;
          border: 1px solid rgba(186,26,26,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          color: #93000a;
          font-size: 13px;
          margin-bottom: 16px;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          height: 48px;
          background: #059669;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(5,150,105,0.2);
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: #047857; }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.8; cursor: not-allowed; }
        .submit-btn.success { background: #006a62; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; display: inline-block; }

        /* Card footer */
        .card-footer {
          background: #f0fdf4;
          border-top: 1px solid #c2c6d4;
          padding: 12px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .card-footer-text {
          font-size: 12px;
          color: #424752;
        }

        /* Support links */
        .support-links {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 24px;
        }
        .support-link {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #727783;
          text-decoration: none;
          transition: color 0.2s;
        }
        .support-link:hover { color: #059669; }
      `}</style>

      <div className="login-root">
        {/* Side imagery panel */}
        <div className="side-panel">
          <div className="side-panel-img" />
          <div className="side-panel-gradient" />
        </div>

        {/* Login card */}
        <div className="login-card-wrapper">
          {/* Branding */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="brand-icon-wrap">
              <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 32 }}>
                medical_services
              </span>
            </div>
            <h1 className="brand-title">Telehealth</h1>
            <p className="brand-sub">Admin Portal</p>
          </div>

          <div className="login-card">
            <div className="card-accent-bar" />
            <div className="card-body">
              {/* Error */}
              {error && (
                <div className="error-msg">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="form-group">
                  <div className="field-header">
                    <label className="field-label" htmlFor="email">Email Address</label>
                  </div>
                  <div className="input-wrap">
                    <span className="material-symbols-outlined input-icon">mail</span>
                    <input
                      id="email"
                      type="email"
                      className={`field-input${error ? " error-input" : ""}`}
                      placeholder="admin@telehealth-system.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <div className="field-header">
                    <label className="field-label" htmlFor="password">Password</label>
                  </div>
                  <div className="input-wrap">
                    <span className="material-symbols-outlined input-icon">lock</span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`field-input pw-input${error ? " error-input" : ""}`}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="pw-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`submit-btn${isSuccess ? " success" : ""}`}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading && !isSuccess && (
                    <>
                      <span className="material-symbols-outlined spin" style={{ fontSize: 20 }}>
                        progress_activity
                      </span>
                      Authenticating...
                    </>
                  )}
                  {isSuccess && (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                      Success
                    </>
                  )}
                  {!isLoading && !isSuccess && (
                    <>
                      Sign In
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card footer */}
            <div className="card-footer">
              <span className="material-symbols-outlined" style={{ color: "#006a62", fontSize: 18 }}>verified_user</span>
              <span className="card-footer-text">Secure encrypted connection</span>
            </div>
          </div>

          {/* Support links */}
          <div className="support-links">
            <a href="#" className="support-link">Help Center</a>
            <a href="#" className="support-link">Security Policy</a>
            <a href="#" className="support-link">v2.4.1</a>
          </div>
        </div>
      </div>
    </>
  );
}
