/**
 * Login Component
 * Email/password sign-in form — styled with Tailwind to match the app design system
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setError('No account found with this email or password');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please check your credentials.');
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
          <h1 className="text-3xl font-bold text-neutral-900">Welcome back</h1>
          <p className="text-neutral-500 mt-2">Sign in to track your carbon footprint</p>
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
                htmlFor="login-email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Email address
              </label>
              <input
                id="login-email"
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
                htmlFor="login-password"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-neutral-500 mt-6 text-sm">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none focus:underline"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

// Made with Bob
