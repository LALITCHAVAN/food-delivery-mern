
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Store,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/helpers';
import type { Order } from '@/lib/types';

import './AdminPages.css';

interface Stats {
  users: number;
  orders: number;
  restaurants: number;
  foods: number;
  revenue: number;
  pending: number;
  delivered: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    orders: 0,
    restaurants: 0,
    foods: 0,
    revenue: 0,
    pending: 0,
    delivered: 0,
  });

  const [recentOrders, setRecentOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  useEffect(() => {
    async function load() {
      try {
        const [
          usersResponse,
          ordersResponse,
          restaurantsResponse,
          foodsResponse,
        ] = await Promise.all([
          api.get('/admin/users'),
          api.get('/orders/admin/all'),
          api.get('/restaurants'),
          api.get('/foods'),
        ]);

        const users =
          usersResponse.data?.users || [];

        const orders =
          ordersResponse.data?.orders || [];

        const restaurants =
          restaurantsResponse.data?.restaurants ||
          [];

        const foods =
          foodsResponse.data?.foods || [];

        // --------------------------------------------------
        // Revenue
        // --------------------------------------------------

        const revenue = orders
          .filter(
            (order: Order) =>
              order.order_status === 'Delivered'
          )
          .reduce(
            (sum: number, order: Order) =>
              sum + Number(order.grand_total || 0),
            0
          );

        // --------------------------------------------------
        // Pending
        // --------------------------------------------------

        const pending = orders.filter(
          (order: Order) =>
            order.order_status !== 'Delivered' &&
            order.order_status !== 'Cancelled'
        ).length;

        // --------------------------------------------------
        // Delivered
        // --------------------------------------------------

        const delivered = orders.filter(
          (order: Order) =>
            order.order_status === 'Delivered'
        ).length;

        // --------------------------------------------------
        // Stats
        // --------------------------------------------------

        setStats({
          users: users.length,
          orders: orders.length,
          restaurants: restaurants.length,
          foods: foods.length,
          revenue,
          pending,
          delivered,
        });

        // Backend already sorts latest first
        setRecentOrders(
          orders.slice(0, 5)
        );
      } catch (error) {
        console.error(
          'Dashboard loading error:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <p className="text-muted">
        Loading dashboard...
      </p>
    );
  }

  const cards = [
    {
      label: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Total Orders',
      value: stats.orders,
      icon: Package,
      color: 'rose',
    },
    {
      label: 'Restaurants',
      value: stats.restaurants,
      icon: Store,
      color: 'green',
    },
    {
      label: 'Total Foods',
      value: stats.foods,
      icon: UtensilsCrossed,
      color: 'amber',
    },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-title">
        Dashboard
      </h1>

      <p className="admin-subtitle">
        Welcome back! Here's what's happening today.
      </p>

      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="stat-cards">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`stat-card stat-${card.color}`}
            >
              <div className="stat-card-icon">
                <Icon size={28} />
              </div>

              <div className="stat-card-info">
                <span>
                  {card.label}
                </span>

                <strong>
                  {card.value}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================
          SECONDARY STATS
      ================================================== */}

      <div className="stat-row">
        <div className="mini-stat">
          <TrendingUp size={20} />

          <div>
            <span>
              Revenue (Delivered)
            </span>

            <strong>
              {formatPrice(
                stats.revenue
              )}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <Clock size={20} />

          <div>
            <span>
              Pending Orders
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <CheckCircle size={20} />

          <div>
            <span>
              Delivered Orders
            </span>

            <strong>
              {stats.delivered}
            </strong>
          </div>
        </div>
      </div>

      {/* ==================================================
          RECENT ORDERS
      ================================================== */}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>
            Recent Orders
          </h2>

          <Link
            to="/admin/orders"
            className="btn btn-secondary admin-sm-btn"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-muted">
            No orders yet.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map(
                  (order) => (
                    <tr key={order.id}>
                      <td>
                        #{order.id.slice(0, 8)}
                      </td>

                      <td>
                        {formatDate(
                          order.created_at
                        )}
                      </td>

                      <td>
                        {order.items.length}
                      </td>

                      <td>
                        {formatPrice(
                          order.grand_total
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            order.order_status ===
                            'Delivered'
                              ? 'badge-success'
                              : 'badge-info'
                          }`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
