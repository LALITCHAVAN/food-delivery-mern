import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calcTotals } from '@/lib/helpers';
import QuantitySelector from '@/components/QuantitySelector';
import './Cart.css';

export default function Cart() {
  const { items, loading, updateQuantity, removeItem, subtotal } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const totals = calcTotals(subtotal);

  if (loading) {
    return (
      <div className="container page">
        <p className="text-muted">Loading your cart...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container page empty-state">
        <ShoppingBag size={64} />
        <h2>Please sign in to view your cart</h2>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page empty-state">
        <ShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any food yet.</p>
        <Link to="/categories" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Foods</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Your Cart</h1>
        <p className="text-muted">{items.length} item(s) in your cart</p>
      </div>

      <div className="cart-layout">
        {/* ---------- Items ---------- */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <Link to={`/foods/${item.food_id}`} className="cart-item-image">
                <img src={item.foods?.image} alt={item.foods?.title} />
              </Link>
              <div className="cart-item-info">
                <Link to={`/foods/${item.food_id}`}>
                  <h3 className="cart-item-title">{item.foods?.title}</h3>
                </Link>
                <p className="cart-item-restaurant">{item.foods?.restaurants?.name}</p>
                <span className="cart-item-price">{formatPrice(item.foods?.price || 0)}</span>
              </div>
              <div className="cart-item-actions">
                <QuantitySelector
                  quantity={item.quantity}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  size="sm"
                />
                <span className="cart-item-total">{formatPrice((item.foods?.price || 0) * item.quantity)}</span>
                <button className="cart-item-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- Summary ---------- */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Charge</span>
            <span>{formatPrice(totals.deliveryCharge)}</span>
          </div>
          <div className="summary-row">
            <span>GST (5%)</span>
            <span>{formatPrice(totals.gst)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Grand Total</span>
            <span>{formatPrice(totals.grandTotal)}</span>
          </div>
          <button className="btn btn-primary btn-block cart-checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>
          <Link to="/categories" className="cart-continue">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
