import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isValidEmail, isValidPhone } from '@/lib/helpers';
import './Auth.css';

export default function Register() {
  const { signUp } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Name is required';
    else if (form.name.length < 2) e.name = 'Enter a valid name';
    if (!form.email) e.email = 'Email is required';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email';
    if (!form.phone) e.phone = 'Phone is required';
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.confirm) e.confirm = 'Confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signUp({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      show('Account created! Welcome to FoodHub.');
      navigate('/');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo-icon"><UtensilsCrossed size={28} /></span>
          <h1>Create Account</h1>
          <p>Join FoodHub and start ordering</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="input-wrap">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)}
              />
            </div>
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
