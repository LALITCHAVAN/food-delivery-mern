import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, UtensilsCrossed, LogOut, Package, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { profile, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon"><UtensilsCrossed size={22} /></span>
          <span className="navbar-logo-text">FoodHub</span>
        </Link>

        <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/categories" className={location.pathname.startsWith('/categories') ? 'active' : ''}>Categories</Link></li>
          <li><Link to="/restaurants" className={location.pathname.startsWith('/restaurants') ? 'active' : ''}>Restaurants</Link></li>
          {profile && <li><Link to="/orders" className={location.pathname.startsWith('/orders') ? 'active' : ''}>My Orders</Link></li>}
          {isAdmin && <li><Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link></li>}
        </ul>

        <div className={`navbar-actions ${mobileOpen ? 'open' : ''}`}>
          {profile ? (
            <>
              <Link to="/cart" className="navbar-cart" aria-label="Cart">
                <ShoppingCart size={22} />
                {count > 0 && <span className="cart-badge">{count}</span>}
              </Link>
              <Link to="/profile" className="navbar-user" aria-label="Profile">
                <User size={20} />
                <span className="navbar-user-name">{profile.name?.split(' ')[0] || 'Account'}</span>
              </Link>
              <button onClick={handleSignOut} className="navbar-icon-btn" aria-label="Sign out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline navbar-login-btn">Login</Link>
              <Link to="/register" className="btn btn-primary navbar-register-btn">Sign Up</Link>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile">
          <Link to="/"><HomeIcon size={18} /> Home</Link>
          <Link to="/categories"><UtensilsCrossed size={18} /> Categories</Link>
          <Link to="/restaurants"><UtensilsCrossed size={18} /> Restaurants</Link>
          {profile && <Link to="/orders"><Package size={18} /> My Orders</Link>}
          {profile && <Link to="/profile"><User size={18} /> Profile</Link>}
          {profile && <Link to="/cart"><ShoppingCart size={18} /> Cart ({count})</Link>}
          {isAdmin && <Link to="/admin"><UtensilsCrossed size={18} /> Admin</Link>}
        </div>
      )}
    </nav>
  );
}
