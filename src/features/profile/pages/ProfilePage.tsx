import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useAuth } from "../../auth/hooks/useAuth";
import { authApi } from "../../auth/api/auth.api";
import { useDepartments } from "../../users/hooks/useUsers";

function getErrorMessage(error: unknown): string {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Şifre değiştirilemedi. Tekrar deneyin.";
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: departments = [] } = useDepartments();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const departmentName =
    departments.find((department) => department.id === user?.departmentId)
      ?.name ?? "—";

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "—";

  const roleName =
    user?.role === "Helpdesk" ? "Helpdesk Yetkilisi" : "Departman Personeli";

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Lütfen tüm şifre alanlarını doldurun.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setError("Yeni şifre 8 ile 128 karakter arasında olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Yeni şifre mevcut şifreden farklı olmalıdır.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      // Backend şifre değişikliğinde refresh tokenları
      // iptal eder. Yerel oturumu da kapatıyoruz.
      try {
        await logout();
      } catch {
        // Backend şifre değişikliğini zaten tamamladı.
        // Yerel oturum logout() içinde temizlenir.
      }

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.",
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-page-heading">
        <div className="profile-eyebrow">
          <UserRound size={16} />
          HESAP YÖNETİMİ
        </div>

        <h1>Profilim</h1>

        <p>
          Hesap bilgilerinizi görüntüleyebilir ve şifrenizi güvenli şekilde
          değiştirebilirsiniz.
        </p>
      </div>

      <section className="profile-identity-card">
        <div className="profile-identity-avatar">
          <UserRound size={31} />
        </div>

        <div className="profile-identity-info">
          <h2>{fullName}</h2>
          <p>{user?.email}</p>

          <div className="profile-role-label">
            <ShieldCheck size={14} />
            {roleName}
          </div>
        </div>
      </section>

      <div className="profile-content-grid">
        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-card-heading-icon">
              <UserRound size={20} />
            </div>

            <div>
              <h2>Hesap Bilgileri</h2>
              <p>Kişisel ve çalışma bilgileriniz</p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-item">
              <UserRound size={19} />
              <div>
                <span>Ad Soyad</span>
                <strong>{fullName}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <Mail size={19} />
              <div>
                <span>E-posta Adresi</span>
                <strong>{user?.email ?? "—"}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <ShieldCheck size={19} />
              <div>
                <span>Kullanıcı Rolü</span>
                <strong>{roleName}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <Building2 size={19} />
              <div>
                <span>Departman</span>
                <strong>{departmentName}</strong>
              </div>
            </div>
          </div>

          <div className="profile-information-note">
            <Users size={18} />
            <p>
              Kişisel bilgilerinizin güncellenmesi gerekiyorsa Helpdesk
              yetkilisiyle iletişime geçebilirsiniz.
            </p>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-card-heading-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h2>Şifre Değiştir</h2>
              <p>Hesabınızın güvenliğini yönetin</p>
            </div>
          </div>

          {error && (
            <div className="profile-error-message" role="alert">
              {error}
            </div>
          )}

          <form
            className="profile-password-form"
            onSubmit={(event) => void handleChangePassword(event)}
          >
            <div className="profile-form-field">
              <label htmlFor="current-password">Mevcut Şifre</label>

              <div className="profile-password-input">
                <KeyRound size={18} />

                <input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Mevcut şifrenizi girin"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((value) => !value)}
                  aria-label={
                    showCurrentPassword ? "Şifreyi gizle" : "Şifreyi göster"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="profile-form-field">
              <label htmlFor="new-password">Yeni Şifre</label>

              <div className="profile-password-input">
                <LockKeyhole size={18} />

                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Yeni şifrenizi girin"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  aria-label={
                    showNewPassword ? "Şifreyi gizle" : "Şifreyi göster"
                  }
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <small>Şifreniz en az 8 karakter olmalıdır.</small>
            </div>

            <div className="profile-form-field">
              <label htmlFor="confirm-password">Yeni Şifre Tekrar</label>

              <div className="profile-password-input">
                <CheckCircle2 size={18} />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="profile-password-warning">
              <ShieldCheck size={19} />

              <p>
                Şifreniz değiştirildiğinde oturumunuz kapatılacak ve yeni
                şifrenizle tekrar giriş yapmanız gerekecek.
              </p>
            </div>

            <button
              type="submit"
              className="profile-submit-button"
              disabled={isSubmitting}
            >
              <LockKeyhole size={17} />
              {isSubmitting ? "Şifre değiştiriliyor..." : "Şifremi Değiştir"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
