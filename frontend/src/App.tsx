/**
 * Main App Component
 * Sets up routing and authentication provider
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SignUp } from './components/auth/SignUp';
import { Login } from './components/auth/Login';
import { Dashboard } from './pages/Dashboard';
import { QuizPage } from './pages/QuizPage';
import { LogActivity } from './pages/LogActivity';
import { TodayView } from './pages/TodayView';
import { Navbar } from './components/common/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Global top navigation bar */}
          <Navbar />

          {/* Page content */}
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/log-activity"
                element={
                  <ProtectedRoute>
                    <LogActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/today"
                element={
                  <ProtectedRoute>
                    <TodayView />
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// Made with Bob
