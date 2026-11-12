import { useState, type FormEvent } from "react";
import axios from "axios";
import { KeyRound, X } from "lucide-react";

import { useResetUserPassword } from "../hooks/useUsers";
import type { User } from "../types/user.types";

interface Props {
  user: User;
  onClose: () => void;
}

export default function ResetPasswordModal({ user, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const mutation = useResetUserPassword();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    try {
      await mutation.mutateAsync({
        id: user.id,
        password,
      });
      onClose();
    } catch (err) {
      setError(
        axios.isAxiosError(err) &&
          typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Şifre güncellenemedi.",
      );
    }
  }

  return (
    <div className="user-modal-backdrop">
      <div
        className="user-modal user-password-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
      >
        <div className="user-modal-header">
          <div className="user-modal-heading">
            <KeyRound size={23} />
            <div>
              <h2 id="reset-password-title">Şifre Sıfırla</h2>
              <p>
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>

          <button
            className="user-icon-button"
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Kapat"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="user-modal-body">
            <label className="user-field">
              <span>Yeni Şifre</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            <label className="user-field">
              <span>Yeni Şifre Tekrar</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </label>

            {error && (
              <div className="user-error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="user-modal-footer">
            <button
              type="button"
              className="user-button secondary"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="user-button primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
