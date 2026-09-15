import React, { useState } from 'react';
import { Sprout, Eye, EyeOff, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await login(form.email, form.password);
      } else {
        res = await register(form.name, form.email, form.password);
      }

      if (!res.success) {
        setError(res.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Connection error. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Branding */}
        <div className="login-brand">
          <div className="login-icon-box">
            <Sprout size={28} />
          </div>
          <div>
            <h1 className="login-title">AI Crop Recommendation</h1>
            <p className="login-brand-sub">Smart farming powered by Machine Learning</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            <UserPlus size={15} /> Create Account
          </button>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p>{mode === 'login' ? 'Sign in to access your crop prediction dashboard.' : 'Register to get started with AI-based crop recommendations.'}</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="login-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="lform-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="lform-control"
                placeholder="e.g. John Doe"
                required
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          )}

          <div className="lform-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="lform-control"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="lform-group">
            <label htmlFor="password">Password</label>
            <div className="lform-password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="lform-control"
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="lform-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="lform-password-wrap">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className="lform-control"
                  placeholder="Re-enter your password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner"></span> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              <>{mode === 'login' ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Create Account</>}</>
            )}
          </button>
        </form>

        <p className="login-switch-text">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="login-switch-link"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>

      <p className="login-footer">
        AI-Based Crop Recommendation System · Random Forest · PERN Stack
      </p>
    </div>
  );
};

export default LoginPage;
