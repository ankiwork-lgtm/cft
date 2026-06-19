/**
 * Sign Up Component
 * Email/password registration form — styled with Tailwind to match the app design system
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Client-side validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      navigate('/dashboard');
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak — please choose a stronger one');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3" aria-hidden="true">🌱</div>
          <h1 className="text-3xl font-bold text-neutral-900">Create your account</h1>
          <p className="text-neutral-500 mt-2">Start tracking your carbon footprint today</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">

          {/* Error alert */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2"
            >
              <span aria-hidden="true" className="text-lg leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Password
                <span className="ml-1 text-neutral-400 font-normal">(min. 6 characters)</span>
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Confirm password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms note */}
          <p className="text-center text-neutral-400 text-xs mt-5">
            By signing up, you agree to track your carbon footprint responsibly 🌍
          </p>
        </div>

        {/* Footer link */}
        <p className="text-center text-neutral-500 mt-6 text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none focus:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Made with Bob
