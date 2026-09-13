import { Link } from 'react-router-dom';
import { UtensilsCrossed, Mail, Phone, MapPin, Share2 } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon"><UtensilsCrossed size={22} /></span>
            <span>FoodHub</span>
          </Link>
          <p>Delivering your favorite meals from the best restaurants, fresh and fast — right to your doorstep.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><Share2 size={18} /></a>
            <a href="#" aria-label="Instagram"><Share2 size={18} /></a>
            <a href="#" aria-label="Twitter"><Share2 size={18} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/restaurants">Restaurants</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/categories/Pizza">Pizza</Link></li>
            <li><Link to="/categories/Burger">Burger</Link></li>
            <li><Link to="/categories/Indian">Indian</Link></li>
            <li><Link to="/categories/Desserts">Desserts</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li><MapPin size={16} /> 123 Food Street, Mumbai, India</li>
            <li><Phone size={16} /> +91 98765 43210</li>
            <li><Mail size={16} /> hello@foodhub.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 FoodHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
