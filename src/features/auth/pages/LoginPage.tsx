import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router";
import axios from "axios";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Headset,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TicketCheck,
  Workflow,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("E-posta adresi veya şifre hatalı.");
        } else if (!err.response) {
          setError("Sunucuya bağlanılamadı. API'nin çalıştığını kontrol edin.");
        } else {
          setError("Giriş işlemi gerçekleştirilemedi.");
        }
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-logo">
          <div className="brand-logo-icon">
            <Headset size={25} strokeWidth={2.2} />
          </div>
          <span>
            TK <strong>Helpdesk</strong>
          </span>
        </div>

        <div className="brand-content">
          <div className="brand-eyebrow">
            <span className="brand-dot" />
            DESTEK YÖNETİM PLATFORMU
          </div>

          <h1>
            Destek süreçleri,
            <br />
            <span>tek bir yerde.</span>
          </h1>

          <p>
            Talepleri yönetin, ekiplerinizle koordineli çalışın ve tüm destek
            süreçlerini kolayca takip edin.
          </p>

          <div className="brand-features">
            <div className="brand-feature">
              <TicketCheck size={20} />
              <span>Merkezi talep yönetimi</span>
            </div>
            <div className="brand-feature">
              <Workflow size={20} />
              <span>Departman bazlı iş akışları</span>
            </div>
            <div className="brand-feature">
              <ShieldCheck size={20} />
              <span>Güvenli ve yetkilendirilmiş erişim</span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          © {new Date().getFullYear()} TK Helpdesk
          <span>Akıllı destek yönetimi</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="mobile-brand">
            <Headset size={24} />
            <span>TK Helpdesk</span>
          </div>

          <div className="login-heading">
            <div className="welcome-label">HOŞ GELDİNİZ</div>
            <h2>Hesabınıza giriş yapın</h2>
            <p>Devam etmek için kurumsal hesap bilgilerinizle oturum açın.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email">E-posta adresi</label>

              <div className="input-wrapper">
                <Mail size={19} />
                <input
                  id="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Şifre</label>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              <span>{submitting ? "Giriş yapılıyor..." : "Giriş Yap"}</span>
              {!submitting && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-security">
            <ShieldCheck size={17} />
            <span>Güvenli oturum açma sistemi</span>
          </div>
        </div>
      </section>
    </main>
  );
}
