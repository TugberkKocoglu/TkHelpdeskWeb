import { useMemo, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  CircleOff,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  useDepartments,
  useUpdateUserStatus,
  useUsers,
} from "../hooks/useUsers";

import UserFormModal from "../components/UserFormModal";
import ResetPasswordModal from "../components/ResetPasswordModal";

import type { User } from "../types/user.types";

type StatusFilter = "all" | "active" | "inactive";

export default function UserListPage() {
  const {
    data: users = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useUsers();

  const { data: departments = [] } = useDepartments();
  const statusMutation = useUpdateUserStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const active = users.filter((u) => u.is_active).length;

    return {
      total: users.length,
      active,
      inactive: users.length - active,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");

    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLocaleLowerCase(
        "tr-TR",
      );

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.email.toLocaleLowerCase("tr-TR").includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  function getDepartmentName(user: User) {
    return (
      user.department?.name ??
      departments.find((d) => d.id === user.department_id)?.name ??
      "—"
    );
  }

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function changeStatus(user: User) {
    const isActive = !user.is_active;

    if (
      !window.confirm(
        `${user.first_name} ${user.last_name} kullanıcısını ${
          isActive ? "aktif" : "pasif"
        } yapmak istediğinize emin misiniz?`,
      )
    ) {
      return;
    }

    setError("");

    try {
      await statusMutation.mutateAsync({
        id: user.id,
        isActive,
      });
    } catch (err) {
      setError(
        axios.isAxiosError(err) &&
          typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Kullanıcı durumu değiştirilemedi.",
      );
    }
  }

  return (
    <div className="users-page">
      <div className="users-page-header">
        <div>
          <div className="users-eyebrow">
            <Users size={16} />
            YÖNETİM
          </div>

          <h1>Kullanıcı Yönetimi</h1>
          <p>Helpdesk yetkililerini ve departman çalışanlarını yönetin.</p>
        </div>

        <button
          type="button"
          className="user-button primary"
          onClick={openCreate}
        >
          <Plus size={18} />
          Yeni Kullanıcı
        </button>
      </div>

      <div className="users-stats">
        <div className="user-stat-card">
          <div className="user-stat-icon blue">
            <Users size={21} />
          </div>
          <span>Toplam Kullanıcı</span>
          <strong>{isPending ? "—" : stats.total}</strong>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <span>Aktif Kullanıcı</span>
          <strong>{isPending ? "—" : stats.active}</strong>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon gray">
            <CircleOff size={21} />
          </div>
          <span>Pasif Kullanıcı</span>
          <strong>{isPending ? "—" : stats.inactive}</strong>
        </div>
      </div>

      <section className="users-table-card">
        <div className="users-table-heading">
          <div>
            <h2>Kullanıcı Listesi</h2>
            <p>Kayıtlı kullanıcılar ve departman bilgileri</p>
          </div>

          <button
            type="button"
            className="user-icon-button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Listeyi yenile"
            title="Listeyi yenile"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="users-toolbar">
          <div className="users-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="İsim veya e-posta ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Role göre filtrele"
          >
            <option value="all">Tüm Roller</option>
            <option value="Helpdesk">Helpdesk</option>
            <option value="Employee">Employee</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Duruma göre filtrele"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>

        {error && (
          <div className="user-error user-page-error" role="alert">
            {error}
          </div>
        )}

        {isPending ? (
          <div className="users-message">Kullanıcılar yükleniyor...</div>
        ) : isError ? (
          <div className="users-message">
            <p>Kullanıcılar yüklenemedi.</p>
            <button
              type="button"
              className="user-button secondary"
              onClick={() => void refetch()}
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            <div className="users-table-scroll">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>Rol</th>
                    <th>Departman</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar">
                            {user.first_name.charAt(0).toUpperCase()}
                            {user.last_name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.first_name} {user.last_name}
                            </strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`user-role-badge ${
                            user.role === "Helpdesk" ? "helpdesk" : "employee"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>{getDepartmentName(user)}</td>

                      <td>
                        <span
                          className={`user-status ${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          {user.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </td>

                      <td>
                        <div className="user-row-actions">
                          <button type="button" onClick={() => openEdit(user)}>
                            <Pencil size={15} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            onClick={() => setPasswordUser(user)}
                          >
                            <KeyRound size={15} />
                            Şifre
                          </button>

                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => void changeStatus(user)}
                          >
                            {user.is_active ? "Pasife Al" : "Aktifleştir"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="users-message">
                  Filtrelere uygun kullanıcı bulunamadı.
                </div>
              )}
            </div>

            <div className="users-table-footer">
              <span>{filteredUsers.length} kullanıcı gösteriliyor</span>
              <span>Toplam {users.length} kayıt</span>
            </div>
          </>
        )}
      </section>

      {formOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setFormOpen(false);
            setEditingUser(null);
          }}
        />
      )}

      {passwordUser && (
        <ResetPasswordModal
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
        />
      )}
    </div>
  );
}
