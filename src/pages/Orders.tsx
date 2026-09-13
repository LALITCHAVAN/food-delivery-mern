
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  ShoppingBag,
} from 'lucide-react';

import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Order, OrderStatus } from '@/lib/types';
import {
  formatPrice,
  formatDate,
  statusBadgeClass,
} from '@/lib/helpers';
import Spinner from '@/components/Spinner';

import './Orders.css';

const STATUS_FILTERS: (OrderStatus | 'All')[] = [
  'All',
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock size={18} />,
  Confirmed: <CheckCircle size={18} />,
  Preparing: <ChefHat size={18} />,
  'Out for Delivery': <Truck size={18} />,
  Delivered: <Package size={18} />,
};

const STATUS_STEPS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

export default function Orders() {
  const { profile } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');

  useEffect(() => {
    async function loadOrders() {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/orders');

        const fetchedOrders = response.data?.orders || [];

        setOrders(fetchedOrders as Order[]);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [profile]);

  if (loading) {
    return <Spinner />;
  }

  const filtered =
    filter === 'All'
      ? orders
      : orders.filter(
          (order) => order.order_status === filter
        );

  return (
    <div className="container page">
      <div className="page-header">
        <h1>My Orders</h1>

        <p className="text-muted">
          Track all your food orders
        </p>
      </div>

      {/* ---------- Status Filter ---------- */}

      <div className="order-filters">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            className={`order-filter-btn ${
              filter === status ? 'active' : ''
            }`}
            onClick={() => setFilter(status)}
          >
            {status !== 'All' && STATUS_ICONS[status]}
            {status}
          </button>
        ))}
      </div>

      {/* ---------- Empty State ---------- */}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={64} />

          <h2>No orders found</h2>

          <p>
            {filter === 'All'
              ? "You haven't placed any orders yet."
              : `No ${filter} orders.`}
          </p>

          <Link
            to="/categories"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            Order Food
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="order-card"
            >
              {/* ---------- Header ---------- */}

              <div className="order-card-header">
                <div>
                  <span className="order-id">
                    Order #{order.id.slice(0, 8)}
                  </span>

                  <span className="order-date">
                    {formatDate(order.created_at)}
                  </span>
                </div>

                <span
                  className={statusBadgeClass(
                    order.order_status
                  )}
                >
                  {STATUS_ICONS[order.order_status]}

                  {order.order_status}
                </span>
              </div>

              {/* ---------- Status Tracker ---------- */}

              <div className="order-tracker">
                {STATUS_STEPS.map((step, index) => {
                  const currentIndex =
                    STATUS_STEPS.indexOf(
                      order.order_status
                    );

                  const done =
                    index <= currentIndex;

                  return (
                    <div
                      key={step}
                      className={`tracker-step ${
                        done ? 'done' : ''
                      }`}
                    >
                      <span className="tracker-dot">
                        {done ? (
                          <CheckCircle size={16} />
                        ) : (
                          index + 1
                        )}
                      </span>

                      <span className="tracker-label">
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ---------- Items ---------- */}

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="order-item"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                    />

                    <div>
                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        Qty: {item.quantity} ×{' '}
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <span className="order-item-total">
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* ---------- Footer ---------- */}

              <div className="order-card-footer">
                <div className="order-address">
                  <strong>Delivery to:</strong>

                  <span>
                    {order.delivery_name
                      ? `${order.delivery_name}, `
                      : ''}
                    {order.delivery_address}

                    {order.delivery_city
                      ? `, ${order.delivery_city}`
                      : ''}

                    {order.delivery_state
                      ? `, ${order.delivery_state}`
                      : ''}

                    {order.delivery_pincode
                      ? ` - ${order.delivery_pincode}`
                      : ''}
                  </span>
                </div>

                <div className="order-totals">
                  <span>
                    Grand Total:{' '}
                    <strong>
                      {formatPrice(
                        order.grand_total
                      )}
                    </strong>
                  </span>

                  <span className="text-muted">
                    {order.payment_method}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
