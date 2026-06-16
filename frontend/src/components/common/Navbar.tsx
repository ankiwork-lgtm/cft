/**
 * Navbar Component
 * Persistent top navigation bar showing the application name
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavLink {
  label: string;
  path: string;
  icon: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Log Activity', path: '/log-activity', icon: '📝' },
  { label: 'Today', path: '/today', icon: '📅' },
];

export function Navbar() {
  const location = useLocation();
  const { currentUser, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigate via Link below; redirect handled by ProtectedRoute after sign-out
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Brand — Issue 1: use <Link>, Issue 2: aria-label, fix focus:outline-none */}
          <Link
            to="/dashboard"
            aria-label="Carbon Footprint Tracker — go to dashboard"
            className="flex items-center gap-2 group rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700"
          >
            <span className="text-2xl drop-shadow select-none" aria-hidden="true">🌿</span>
            <span className="text-white font-bold text-base sm:text-lg leading-tight tracking-tight group-hover:opacity-90 transition-opacity">
              Ankit's Carbon Footprint Tracker
            </span>
          </Link>

          {/* Nav links — hidden on mobile — Issue 1: use <Link>, Issue 2: aria-current */}
          {currentUser && (
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-green-700 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-inner'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-white/70 text-xs truncate max-w-[140px]">
                {currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-all font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-green-700"
              >
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile nav links — Issue 1: use <Link>, Issue 2: aria-current */}
        {currentUser && (
          <nav aria-label="Mobile navigation" className="md:hidden flex gap-1 pb-2 overflow-x-auto">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-green-700 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </nav>
  );
}

// Made with Bob
