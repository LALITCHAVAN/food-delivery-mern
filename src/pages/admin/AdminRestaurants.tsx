import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Store } from "lucide-react";

import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { Restaurant } from "@/lib/types";

import "./AdminPages.css";

const EMPTY = {
  name: "",
  address: "",
  image: "",
  rating: "4.5",
  delivery_time: "30-40 min",
};

export default function AdminRestaurants() {
  const { show } = useToast();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);

  const [form, setForm] = useState<Record<string, string>>({
    ...EMPTY,
  });

  // ================================
  // LOAD RESTAURANTS
  // ================================
  async function load() {
    try {
      setLoading(true);

      const response = await api.get("/restaurants");

      setRestaurants(
        (response.data?.restaurants || []) as Restaurant[]
      );
    } catch (error) {
      console.error("Load Restaurants Error:", error);

      show("Could not load restaurants", "error");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ================================
  // ADD
  // ================================
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY });
    setModal(true);
  }

  // ================================
  // EDIT
  // ================================
  function openEdit(r: Restaurant) {
    setEditing(r);

    setForm({
      name: r.name || "",
      address: r.address || "",
      image: r.image || "",
      rating: String(r.rating ?? 4.5),
      delivery_time: r.delivery_time || "30-40 min",
    });

    setModal(true);
  }

  // ================================
  // SUBMIT
  // ================================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const payload = {
        name: form.name,
        address: form.address,
        image: form.image,
        rating: parseFloat(form.rating) || 4.5,
        delivery_time: form.delivery_time,
      };

      if (editing) {
        await api.put(`/restaurants/${editing.id}`, payload);

        show("Restaurant updated!");
      } else {
        await api.post("/restaurants", payload);

        show("Restaurant added!");
      }

      setModal(false);

      await load();
    } catch (error: any) {
      console.error("Restaurant Save Error:", error);

      show(
        error?.response?.data?.message ||
          error?.message ||
          "Operation failed",
        "error"
      );
    }
  }

  // ================================
  // DELETE
  // ================================
  async function handleDelete(r: Restaurant) {
    if (!confirm(`Delete "${r.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/restaurants/${r.id}`);

      show("Restaurant deleted");

      await load();
    } catch (error: any) {
      console.error("Restaurant Delete Error:", error);

      show(
        error?.response?.data?.message ||
          "Could not delete restaurant",
        "error"
      );
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-title">
          Restaurant Management
        </h1>

        <button
          className="btn btn-primary"
          onClick={openAdd}
        >
          <Plus size={18} />
          Add Restaurant
        </button>
      </div>

      {/* ================================
          LOADING
      ================================= */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {restaurants.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center" }}
                  >
                    No restaurants found.
                  </td>
                </tr>
              ) : (
                restaurants.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <img
                        src={r.image}
                        alt={r.name}
                        className="admin-thumb"
                      />
                    </td>

                    <td>
                      <strong>{r.name}</strong>
                    </td>

                    <td>{r.address}</td>

                    <td>{r.rating} ★</td>

                    <td>{r.delivery_time}</td>

                    <td>
                      <div className="admin-actions">
                        <button
                          onClick={() => openEdit(r)}
                          className="admin-action-btn"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(r)}
                          className="admin-action-btn danger"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================================
          MODAL
      ================================= */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setModal(false)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>
                {editing
                  ? "Edit Restaurant"
                  : "Add Restaurant"}
              </h2>

              <button
                onClick={() => setModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-modal-form"
            >
              {/* NAME */}
              <div className="form-group">
                <label className="form-label">
                  Name
                </label>

                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* ADDRESS */}
              <div className="form-group">
                <label className="form-label">
                  Address
                </label>

                <input
                  className="form-input"
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              {/* IMAGE */}
              <div className="form-group">
                <label className="form-label">
                  Image URL
                </label>

                <input
                  className="form-input"
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  required
                />
              </div>

              {/* RATING + DELIVERY */}
              <div className="admin-form-row">
                <div className="form-group">
                  <label className="form-label">
                    Rating
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="form-input"
                    value={form.rating}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rating: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Delivery Time
                  </label>

                  <input
                    className="form-input"
                    value={form.delivery_time}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        delivery_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Store size={18} />

                  {editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}