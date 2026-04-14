/**
 * Jesko — App.jsx
 * Main application router. All pages and route guards are configured here.
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import CarsPage       from './pages/CarsPage';
import DriversPage    from './pages/DriversPage';
import BookingPage    from './pages/BookingPage';
import UserDashboard  from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminPanel     from './pages/AdminPanel';

function SmartDashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'owner')  return <Navigate to="/owner/dashboard" replace />;
  if (user?.role === 'driver') return <Navigate to="/driver/dashboard" replace />;
  if (user?.role === 'admin')  return <Navigate to="/admin" replace />;
  return <UserDashboard />;
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* ── Public ──────────────────────────────── */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cars"    element={<CarsPage />} />
        <Route path="/drivers" element={<DriversPage />} />

        {/* ── Protected ────────────────────────────── */}
        <Route path="/cars/:carId/book" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <BookingPage />
          </ProtectedRoute>
        } />

        {/* Smart dashboard redirect */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SmartDashboardRedirect />
          </ProtectedRoute>
        } />

        <Route path="/owner/dashboard" element={
          <ProtectedRoute allowedRoles={['owner', 'admin']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/driver/dashboard" element={
          <ProtectedRoute allowedRoles={['driver', 'admin']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } />

        {/* ── Fallback ─────────────────────────────── */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <p className="text-7xl mb-6">🚗</p>
            <h1 className="text-4xl font-black text-white mb-3">404 — Off Road</h1>
            <p className="text-gray-400 mb-8">This page doesn't exist. Let's get you back on track.</p>
            <a href="/" className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold hover:from-brand-600 hover:to-brand-700 transition-all">
              Back to Home
            </a>
          </div>
        } />
      </Routes>

      {/* Global floating chatbot widget */}
      <ChatbotWidget />
    </>
  );
}
