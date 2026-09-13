
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Package,
  LogOut,
  Lock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/helpers";
import type { Order } from "@/lib/types";

import "./Profile.css";

export default function Profile() {
  const { profile, updateProfile, signOut } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<
    "profile" | "password" | "history"
  >("profile");

  // ======================================================
  // PROFILE
  // ======================================================

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Keep form fields synced with logged-in profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  // ======================================================
  // PASSWORD
  // ======================================================

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  // ======================================================
  // ORDERS
  // ======================================================

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!profile) {
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);

        const response = await api.get("/orders");

        const fetchedOrders =
          response.data?.orders || [];

        // Show latest 10 orders
        setOrders(
          (fetchedOrders as Order[]).slice(0, 10)
        );
      } catch (error) {
        console.error(
          "Failed to load order history:",
          error
        );

        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }

    loadOrders();
  }, [profile]);

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  async function handleUpdateProfile(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!name.trim()) {
      show("Name is required", "error");
      return;
    }

    setSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      show("Profile updated!");
    } catch (error: any) {
      console.error(
        "Profile update error:",
        error
      );

      show(
        error?.response?.data?.message ||
          "Could not update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  async function handleChangePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!oldPwd) {
      show(
        "Please enter your current password",
        "error"
      );
      return;
    }

    if (!newPwd) {
      show(
        "Please enter a new password",
        "error"
      );
      return;
    }

    if (newPwd.length < 6) {
      show(
        "Password must be at least 6 characters",
        "error"
      );
      return;
    }

    if (newPwd !== confirmPwd) {
      show(
        "Passwords do not match",
        "error"
      );
      return;
    }

    if (oldPwd === newPwd) {
      show(
        "New password must be different",
        "error"
      );
      return;
    }

    setPwdSaving(true);

    try {
      await api.put("/auth/password", {
        oldPassword: oldPwd,
        newPassword: newPwd,
      });

      show("Password changed successfully!");

      setOldPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (error: any) {
      console.error(
        "Change password error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "Could not change password";

      show(message, "error");
    } finally {
      setPwdSaving(false);
    }
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  // ======================================================
  // PROFILE LOADING
  // ======================================================

  if (!profile) {
    return null;
  }

  return (
    <div className="container page">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="page-header">
        <h1>My Profile</h1>

        <p className="text-muted">
          Manage your account
        </p>
      </div>

      <div className="profile-layout">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <User size={48} />
          </div>

          <h3>
            {profile.name || "User"}
          </h3>

          <p className="profile-email">
            {profile.email}
          </p>

          {profile.role === "admin" && (
            <span className="badge badge-info">
              <ShieldCheck size={14} />
              Admin
            </span>
          )}

          <nav className="profile-nav">

            {/* PROFILE */}
            <button
              className={
                tab === "profile"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("profile")
              }
            >
              <User size={18} />
              Profile
            </button>

            {/* PASSWORD */}
            <button
              className={
                tab === "password"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("password")
              }
            >
              <Lock size={18} />
              Password
            </button>

            {/* HISTORY */}
            <button
              className={
                tab === "history"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("history")
              }
            >
              <Package size={18} />
              Order History
            </button>

            {/* LOGOUT */}
            <button
              onClick={handleSignOut}
              className="profile-logout"
            >
              <LogOut size={18} />
              Logout
            </button>

          </nav>
        </aside>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <section className="profile-content">

          {/* ==================================================
              PROFILE TAB
          ================================================== */}

          {tab === "profile" && (
            <div className="profile-panel">
              <h2>Update Profile</h2>

              <form
                onSubmit={handleUpdateProfile}
                className="profile-form"
              >

                {/* NAME */}
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Full Name
                  </label>

                  <input
                    className="form-input"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={16} />
                    Email
                  </label>

                  <input
                    className="form-input"
                    value={profile.email}
                    disabled
                  />
                </div>

                {/* PHONE */}
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} />
                    Phone
                  </label>

                  <input
                    className="form-input"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                {/* ADDRESS */}
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} />
                    Address
                  </label>

                  <textarea
                    className="form-textarea"
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    placeholder="Enter your address"
                  />
                </div>

                {/* SAVE */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </form>
            </div>
          )}

          {/* ==================================================
              PASSWORD TAB
          ================================================== */}

          {tab === "password" && (
            <div className="profile-panel">
              <h2>Change Password</h2>

              <form
                onSubmit={handleChangePassword}
                className="profile-form"
              >

                {/* CURRENT PASSWORD */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={16} />
                    Current Password
                  </label>

                  <input
                    type="password"
                    className="form-input"
                    value={oldPwd}
                    onChange={(e) =>
                      setOldPwd(e.target.value)
                    }
                    placeholder="Enter current password"
                    required
                  />
                </div>

                {/* NEW PASSWORD */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={16} />
                    New Password
                  </label>

                  <input
                    type="password"
                    className="form-input"
                    value={newPwd}
                    onChange={(e) =>
                      setNewPwd(e.target.value)
                    }
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={16} />
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    className="form-input"
                    value={confirmPwd}
                    onChange={(e) =>
                      setConfirmPwd(e.target.value)
                    }
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>

                {/* CHANGE */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pwdSaving}
                >
                  {pwdSaving
                    ? "Changing..."
                    : "Change Password"}
                </button>

              </form>
            </div>
          )}

          {/* ==================================================
              ORDER HISTORY TAB
          ================================================== */}

          {tab === "history" && (
            <div className="profile-panel">
              <h2>Order History</h2>

              {ordersLoading ? (
                <p className="text-muted">
                  Loading orders...
                </p>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />

                  <p>
                    You haven't placed any
                    orders yet.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate("/restaurants")
                    }
                  >
                    Browse Restaurants
                  </button>
                </div>
              ) : (
                <div className="profile-orders">

                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="profile-order-card"
                    >

                      {/* ORDER HEADER */}
                      <div className="profile-order-header">
                        <div>
                          <strong>
                            Order #
                            {order.id.slice(
                              0,
                              8
                            )}
                          </strong>

                          <span className="text-muted">
                            {formatDate(
                              order.created_at
                            )}
                          </span>
                        </div>

                        <span
                          className={`badge ${
                            order.order_status ===
                            "Delivered"
                              ? "badge-success"
                              : order.order_status ===
                                "Cancelled"
                              ? "badge-error"
                              : "badge-info"
                          }`}
                        >
                          {order.order_status}
                        </span>
                      </div>

                      {/* ITEMS */}
                      <div className="profile-order-items">
                        {order.items.map(
                          (item, index) => (
                            <div
                              key={`${order.id}-${index}`}
                              className="profile-order-item"
                            >
                              <img
                                src={item.image}
                                alt={
                                  item.title
                                }
                              />

                              <div>
                                <strong>
                                  {item.title}
                                </strong>

                                <span className="text-muted">
                                  Qty:{" "}
                                  {
                                    item.quantity
                                  }
                                </span>
                              </div>

                              <strong>
                                {formatPrice(
                                  item.price *
                                    item.quantity
                                )}
                              </strong>
                            </div>
                          )
                        )}
                      </div>

                      {/* ORDER FOOTER */}
                      <div className="profile-order-footer">
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatPrice(
                            order.grand_total
                          )}
                        </strong>
                      </div>

                    </div>
                  ))}

                  {/* VIEW ALL */}
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      navigate("/orders")
                    }
                  >
                    View All Orders
                  </button>

                </div>
              )}
            </div>
          )}

        </section>
      </div>
    </div>
  );
}
