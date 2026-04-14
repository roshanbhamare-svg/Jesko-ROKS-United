/**
 * Jesko — Driver Dashboard
 * Manage availability, view assigned bookings, and track score/earnings.
 */
import { useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, XCircle, Zap, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { driversAPI, bookingsAPI } from '../services/api';
import BookingCard from '../components/BookingCard';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ license_number: '', experience_years: 0, current_location: '' });

  const load = async () => {
    try {
      const { data: driverData } = await driversAPI.getMe();
      setDriver(driverData);
      const { data: bookingsData } = await bookingsAPI.list();
      setBookings(bookingsData);
    } catch (err) {
      if (err.response?.status === 404) setDriver(null);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await driversAPI.register({ ...regForm, experience_years: parseInt(regForm.experience_years) });
      toast.success('Driver profile created! 🎉');
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Registration failed'); }
    finally { setRegistering(false); }
  };

  const toggleAvailability = async () => {
    try {
      await driversAPI.updateMe({ is_available: !driver.is_available });
      toast.success(`You're now ${!driver.is_available ? 'available' : 'offline'}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      toast.success(`Booking ${status}`);
      load();
    } catch { toast.error('Action failed'); }
  };

  const earnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.driver_fee || 0) * 0.85, 0);
  const pendingBookings = bookings.filter(b => b.status === 'requested');

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>;

  // No driver profile — show registration form
  if (!driver) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 page-enter flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-5xl mb-4">🧑‍✈️</p>
            <h1 className="text-2xl font-black text-white">Complete Driver Registration</h1>
            <p className="text-gray-400 mt-2">Add your details to start accepting rides</p>
          </div>
          <form onSubmit={handleRegister} className="glass-strong rounded-2xl p-8 space-y-5 border border-white/10">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">License Number</label>
              <input type="text" value={regForm.license_number} onChange={e => setRegForm({...regForm, license_number: e.target.value})} required placeholder="MH0120240012345"
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Years of Experience</label>
              <input type="number" value={regForm.experience_years} onChange={e => setRegForm({...regForm, experience_years: e.target.value})} min="0" required
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Location</label>
              <input type="text" value={regForm.current_location} onChange={e => setRegForm({...regForm, current_location: e.target.value})} placeholder="Mumbai, Maharashtra"
                className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm" />
            </div>
            <button type="submit" disabled={registering} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm hover:from-brand-600 hover:to-brand-700 btn-press disabled:opacity-50 transition-all">
              {registering ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</span> : 'Register as Driver'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const scoreGrade = driver.driver_score >= 85 ? 'A' : driver.driver_score >= 70 ? 'B' : driver.driver_score >= 50 ? 'C' : 'D';
  const gradeColor = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400' }[scoreGrade];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Driver Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <button onClick={toggleAvailability}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all btn-press ${
              driver.is_available ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            }`}>
            {driver.is_available ? <><CheckCircle size={16} /> Online</> : <><XCircle size={16} /> Offline</>}
          </button>
        </div>

        {/* Driver Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Trips', value: driver.total_trips, icon: Zap, color: 'text-blue-400' },
            { label: 'Rating', value: driver.rating?.toFixed(1) + ' ⭐', icon: Star, color: 'text-yellow-400' },
            { label: 'Driver Score', value: `${driver.driver_score?.toFixed(0)} (${scoreGrade})`, icon: Award, color: gradeColor },
            { label: 'Earnings (85%)', value: `₹${Math.round(earnings).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5 stat-glow">
              <s.icon size={20} className={s.color} />
              <p className="text-2xl font-black text-white mt-3">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-bold text-white mb-4">Driver Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-xs text-gray-500">License</p><p className="text-white font-medium mt-0.5">{driver.license_number}</p></div>
            <div><p className="text-xs text-gray-500">Experience</p><p className="text-white font-medium mt-0.5">{driver.experience_years} years</p></div>
            <div><p className="text-xs text-gray-500">Acceptance Rate</p><p className="text-emerald-400 font-medium mt-0.5">{(driver.acceptance_rate * 100).toFixed(0)}%</p></div>
            <div><p className="text-xs text-gray-500">Cancellation Rate</p><p className="text-red-400 font-medium mt-0.5">{(driver.cancellation_rate * 100).toFixed(0)}%</p></div>
          </div>
          {/* Score bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Trust Score</span><span className={gradeColor}>{driver.driver_score?.toFixed(0)}/100</span>
            </div>
            <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500" style={{ width: `${driver.driver_score}%` }} />
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">New Requests ({pendingBookings.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingBookings.map(b => <BookingCard key={b.id} booking={b} onAction={handleBookingAction} />)}
            </div>
          </div>
        )}

        {/* All bookings */}
        {bookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">My Trips</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {bookings.slice(0, 6).map(b => <BookingCard key={b.id} booking={b} onAction={handleBookingAction} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
