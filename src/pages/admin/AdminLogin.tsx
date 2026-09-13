import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import '@/pages/Auth.css';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      show('Welcome, Admin!');
      const from = (location.state as { from?: string })?.from || '/admin';
      navigate(from);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo-icon"><UtensilsCrossed size={28} /></span>
          <h1>Admin Login</h1>
          <p>Sign in to the FoodHub admin panel</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <Mail size={18} className="input-icon" />
              <input type="email" className="form-input" placeholder="admin@foodhub.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login">Back to user login</Link>
        </p>
      </div>
    </div>
  );
}
