import { useEffect, useState } from "react";
import { Users, Ban, Trash2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/helpers";
import type { Profile } from "@/lib/types";
import "./AdminPages.css";

export default function AdminUsers() {
  const { show } = useToast();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      setUsers((response.data?.users || []) as Profile[]);
    } catch (error) {
      console.error("Failed to load users:", error);
      show("Could not load users", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBlock(user: Profile) {
    try {
      await api.put(`/admin/users/${user.id}/block`);

      const newBlockedStatus = !user.blocked;

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                blocked: newBlockedStatus,
              }
            : item
        )
      );

      show(
        newBlockedStatus ? "User blocked" : "User unblocked"
      );
    } catch (error) {
      console.error("Failed to update user:", error);
      show("Could not update user", "error");
    }
  }

  async function handleDelete(user: Profile) {
    const confirmed = confirm(
      `Delete user "${user.name || user.email}"? This removes their profile record.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${user.id}`);

      show("User deleted");

      setUsers((prev) =>
        prev.filter((item) => item.id !== user.id)
      );
    } catch (error) {
      console.error("Failed to delete user:", error);
      show("Could not delete user", "error");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-title">User Management</h1>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>No users found.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name || "—"}</strong>
                  </td>

                  <td>{user.email}</td>

                  <td>{user.phone || "—"}</td>

                  <td>
                    {user.role === "admin" ? (
                      <span className="badge badge-info">
                        <ShieldCheck size={14} />
                        Admin
                      </span>
                    ) : (
                      <span className="badge">User</span>
                    )}
                  </td>

                  <td>
                    {user.blocked ? (
                      <span className="badge badge-error">
                        Blocked
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        Active
                      </span>
                    )}
                  </td>

                  <td>{formatDate(user.created_at)}</td>

                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => toggleBlock(user)}
                        className="admin-action-btn"
                        title={
                          user.blocked ? "Unblock" : "Block"
                        }
                      >
                        <Ban size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(user)}
                        className="admin-action-btn danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}