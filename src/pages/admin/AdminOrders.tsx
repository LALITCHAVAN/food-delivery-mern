import { useEffect, useState } from "react";
import { ArrowRight, Package } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import {
  formatPrice,
  formatDate,
  statusBadgeClass,
  ORDER_STATUSES,
  nextStatus,
} from "@/lib/helpers";
import type { Order, OrderStatus } from "@/lib/types";
import "./AdminPages.css";

export default function AdminOrders() {
  const { show } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "All">("All");

  async function load() {
    try {
      setLoading(true);

      const response = await api.get("/orders/admin/all");

      setOrders((response.data?.orders || []) as Order[]);
    } catch (error) {
      console.error("Failed to load orders:", error);
      show("Could not load orders", "error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function advanceStatus(order: Order) {
    const newStatus = nextStatus(
      order.order_status
    ) as OrderStatus;

    try {
      await api.put(`/orders/${order.id}/status`, {
        status: newStatus,
      });

      show(`Order moved to "${newStatus}"`);

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? {
                ...item,
                order_status: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      show("Could not update status", "error");
    }
  }

  async function setStatus(
    order: Order,
    status: OrderStatus
  ) {
    try {
      await api.put(`/orders/${order.id}/status`, {
        status,
      });

      show(`Order status set to "${status}"`);

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? {
                ...item,
                order_status: status,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      show("Could not update status", "error");
    }
  }

  const filtered =
    filter === "All"
      ? orders
      : orders.filter(
          (order) => order.order_status === filter
        );

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-title">Order Management</h1>
      </div>

      <div className="order-filters">
        {(["All", ...ORDER_STATUSES] as (
          | OrderStatus
          | "All"
        )[]).map((status) => (
          <button
            key={status}
            className={`order-filter-btn ${
              filter === status ? "active" : ""
            }`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="admin-order-card"
            >
              <div className="admin-order-top">
                <div>
                  <strong>
                    #{order.id.slice(0, 8)}
                  </strong>

                  <span className="text-muted">
                    {formatDate(order.created_at)}
                  </span>
                </div>

                <span
                  className={statusBadgeClass(
                    order.order_status
                  )}
                >
                  {order.order_status}
                </span>
              </div>

              <div className="admin-order-items">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="admin-order-item"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                    />

                    <span>
                      {item.title} × {item.quantity}
                    </span>

                    <strong>
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="admin-order-bottom">
                <div className="admin-order-addr">
                  <strong>Deliver to:</strong>{" "}
                  {order.delivery_name},{" "}
                  {order.delivery_address},{" "}
                  {order.delivery_city} -{" "}
                  {order.delivery_pincode}
                </div>

                <div className="admin-order-actions">
                  <span className="admin-order-total">
                    {formatPrice(order.grand_total)}
                  </span>

                  <select
                    className="form-select admin-status-select"
                    value={order.order_status}
                    onChange={(event) =>
                      setStatus(
                        order,
                        event.target
                          .value as OrderStatus
                      )
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>

                  {order.order_status !== "Delivered" &&
                    order.order_status !== "Cancelled" && (
                      <button
                        className="btn btn-primary admin-sm-btn"
                        onClick={() =>
                          advanceStatus(order)
                        }
                      >
                        Advance
                        <ArrowRight size={16} />
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}