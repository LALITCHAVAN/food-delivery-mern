import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { formatPrice, calcTotals, isValidPhone, isValidPincode } from '@/lib/helpers';
import './Checkout.css';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { profile } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: profile?.name || '',
    mobile: profile?.phone || '',
    address: profile?.address || '',
    city: '',
    state: '',
    pincode: '',
  });

  const [payment, setPayment] = useState('COD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const totals = calcTotals(subtotal);

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};

    if (!form.name) e.name = 'Name is required';

    if (!form.mobile) {
      e.mobile = 'Mobile is required';
    } else if (!isValidPhone(form.mobile)) {
      e.mobile = 'Enter a valid 10-digit mobile';
    }

    if (!form.address) e.address = 'Address is required';
    if (!form.city) e.city = 'City is required';
    if (!form.state) e.state = 'State is required';

    if (!form.pincode) {
      e.pincode = 'Pincode is required';
    } else if (!isValidPincode(form.pincode)) {
      e.pincode = 'Enter a valid 6-digit pincode';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    if (!validate() || !profile) return;

    setPlacing(true);

    try {
      const orderItems = items.map((i) => ({
        food_id: i.food_id,
        title: i.foods?.title || '',
        image: i.foods?.image || '',
        price: i.foods?.price || 0,
        quantity: i.quantity,
      }));

      const response = await api.post('/orders', {
        items: orderItems,
        total_price: totals.subtotal,
        delivery_charge: totals.deliveryCharge,
        gst: totals.gst,
        grand_total: totals.grandTotal,
        payment_method: payment,
        order_status: 'Pending',

        delivery_name: form.name,
        delivery_mobile: form.mobile,
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_state: form.state,
        delivery_pincode: form.pincode,
      });

      if (!response.data) {
        throw new Error('Could not place order');
      }

      await clearCart();

      show('Order placed successfully!');

      navigate('/orders');
    } catch (err: any) {
      console.error('Place order error:', err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Could not place order';

      show(message, 'error');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container page empty-state">
        <h2>Your cart is empty</h2>

        <Link
          to="/categories"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Browse Foods
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Checkout</h1>
        <p className="text-muted">Complete your order</p>
      </div>

      <form className="checkout-layout" onSubmit={handlePlaceOrder}>

        {/* ---------- Delivery Details ---------- */}

        <div className="checkout-section">
          <h3>Delivery Details</h3>

          <div className="checkout-form-grid">

            <div className="form-group">
              <label className="form-label">Full Name</label>

              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="John Doe"
              />

              {errors.name && (
                <span className="form-error">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>

              <input
                type="tel"
                className={`form-input ${errors.mobile ? 'error' : ''}`}
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder="9876543210"
              />

              {errors.mobile && (
                <span className="form-error">
                  {errors.mobile}
                </span>
              )}
            </div>

            <div className="form-group full">
              <label className="form-label">Address</label>

              <textarea
                className={`form-textarea ${errors.address ? 'error' : ''}`}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="House no, Street, Area"
              />

              {errors.address && (
                <span className="form-error">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">City</label>

              <input
                type="text"
                className={`form-input ${errors.city ? 'error' : ''}`}
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Mumbai"
              />

              {errors.city && (
                <span className="form-error">
                  {errors.city}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">State</label>

              <input
                type="text"
                className={`form-input ${errors.state ? 'error' : ''}`}
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
                placeholder="Maharashtra"
              />

              {errors.state && (
                <span className="form-error">
                  {errors.state}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>

              <input
                type="text"
                className={`form-input ${errors.pincode ? 'error' : ''}`}
                value={form.pincode}
                onChange={(e) => set('pincode', e.target.value)}
                placeholder="400001"
              />

              {errors.pincode && (
                <span className="form-error">
                  {errors.pincode}
                </span>
              )}
            </div>

          </div>

          {/* ---------- Payment Method ---------- */}

          <h3 className="checkout-subtitle">
            Payment Method
          </h3>

          <div className="payment-options">

            <label
              className={`payment-option ${
                payment === 'COD' ? 'active' : ''
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={payment === 'COD'}
                onChange={() => setPayment('COD')}
              />

              <Banknote size={20} />

              <span>Cash on Delivery</span>
            </label>

            <label
              className={`payment-option ${
                payment === 'Card' ? 'active' : ''
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="Card"
                checked={payment === 'Card'}
                onChange={() => setPayment('Card')}
              />

              <CreditCard size={20} />

              <span>Credit / Debit Card</span>
            </label>

            <label
              className={`payment-option ${
                payment === 'Wallet' ? 'active' : ''
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="Wallet"
                checked={payment === 'Wallet'}
                onChange={() => setPayment('Wallet')}
              />

              <Wallet size={20} />

              <span>Wallet</span>
            </label>

          </div>
        </div>

        {/* ---------- Order Summary ---------- */}

        <div className="checkout-summary">

          <h3>Order Summary</h3>

          <div className="checkout-items">

            {items.map((item) => (
              <div
                key={item.id}
                className="checkout-item"
              >
                <img
                  src={item.foods?.image}
                  alt={item.foods?.title}
                />

                <div>
                  <strong>{item.foods?.title}</strong>

                  <span>
                    Qty: {item.quantity}
                  </span>
                </div>

                <span className="checkout-item-price">
                  {formatPrice(
                    (item.foods?.price || 0) *
                      item.quantity
                  )}
                </span>
              </div>
            ))}

          </div>

          <div className="summary-row">
            <span>Subtotal</span>

            <span>
              {formatPrice(totals.subtotal)}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery Charge</span>

            <span>
              {formatPrice(totals.deliveryCharge)}
            </span>
          </div>

          <div className="summary-row">
            <span>GST (5%)</span>

            <span>
              {formatPrice(totals.gst)}
            </span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row summary-total">
            <span>Grand Total</span>

            <span>
              {formatPrice(totals.grandTotal)}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block checkout-place-btn"
            disabled={placing}
          >
            <CheckCircle size={18} />

            {placing
              ? 'Placing Order...'
              : 'Place Order'}
          </button>

        </div>
      </form>
    </div>
  );
}