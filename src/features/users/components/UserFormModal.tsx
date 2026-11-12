import { useState, type FormEvent } from "react";
import axios from "axios";
import { X, UserRoundPlus } from "lucide-react";

import {
  useCreateUser,
  useDepartments,
  useUpdateUser,
} from "../hooks/useUsers";

import type { User, UserRole } from "../types/user.types";

interface Props {
  user: User | null;
  onClose: () => void;
}

export default function UserFormModal({ user, onClose }: Props) {
  const { data: departments = [], isPending: departmentsLoading } =
    useDepartments();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role ?? "Employee");
  const [departmentId, setDepartmentId] = useState<number>(
    user?.department_id ?? 0,
  );
  const [error, setError] = useState("");

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filteredDepartments = departments.filter((department) => {
    const isHelpdeskDepartment =
      department.name.toLocaleLowerCase("tr-TR") === "helpdesk";

    return role === "Helpdesk" ? isHelpdeskDepartment : !isHelpdeskDepartment;
  });

  function changeRole(nextRole: UserRole) {
    setRole(nextRole);
    setDepartmentId(0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setError("");

    if (!departmentId) {
      setError("Lütfen bir departman seçin.");
      return;
    }

    if (
      !filteredDepartments.some((department) => department.id === departmentId)
    ) {
      setError("Seçilen departman bu role uygun değil.");
      return;
    }

    try {
      const values = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        departmentId,
      };

      if (user) {
        await updateMutation.mutateAsync({
          id: user.id,
          input: values,
        });
      } else {
        await createMutation.mutateAsync({
          ...values,
          password,
        });
      }

      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : "Kullanıcı kaydedilemedi.",
        );
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
    }
  }

  return (
    <div className="user-modal-backdrop">
      <div
        className="user-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        <div className="user-modal-header">
          <div className="user-modal-heading">
            <UserRoundPlus size={23} />
            <div>
              <h2 id="user-modal-title">
                {user ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
              </h2>
              <p>Kullanıcı ve departman bilgileri</p>
            </div>
          </div>

          <button
            className="user-icon-button"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Kapat"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="user-modal-body">
            <div className="user-form-grid">
              <label className="user-field">
                <span>Ad *</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={100}
                />
              </label>

              <label className="user-field">
                <span>Soyad *</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  maxLength={100}
                />
              </label>
            </div>

            <label className="user-field">
              <span>E-posta *</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {!user && (
              <label className="user-field">
                <span>Başlangıç Şifresi *</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
            )}

            <div className="user-form-grid">
              <label className="user-field">
                <span>Rol *</span>
                <select
                  value={role}
                  onChange={(e) => changeRole(e.target.value as UserRole)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Helpdesk">Helpdesk</option>
                </select>
              </label>

              <label className="user-field">
                <span>Departman *</span>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  disabled={departmentsLoading}
                  required
                >
                  <option value={0}>Departman seçin</option>
                  {filteredDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

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
              disabled={isSaving}
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="user-button primary"
              disabled={isSaving || departmentsLoading}
            >
              {isSaving
                ? "Kaydediliyor..."
                : user
                  ? "Değişiklikleri Kaydet"
                  : "Kullanıcı Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
