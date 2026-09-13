import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Tag, Store, Package, Users, LogOut, Menu, X, Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/foods', label: 'Foods', icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <UtensilsCrossed size={22} /> FoodHub
          </Link>
          <span className="admin-badge-tag">Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-nav-link ${active ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link"><Home size={18} /> Back to Site</Link>
          <button onClick={handleSignOut} className="admin-nav-link admin-logout">
            <LogOut size={18} /> Sign Out
          </button>
          <div className="admin-user-info">
            <strong>{profile?.name || 'Admin'}</strong>
            <span>{profile?.email}</span>
          </div>
        </div>
      </aside>

      <button className="admin-toggle" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
