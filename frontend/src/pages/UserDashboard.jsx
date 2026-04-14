/**
 * Jesko — User Dashboard
 * Shows user's bookings, recommendations, and quick actions.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, TrendingUp, Clock, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, aiAPI } from '../services/api';
import BookingCard from '../components/BookingCard';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await bookingsAPI.list();
        setBookings(data);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = bookings.filter((b) => ['requested', 'accepted', 'ongoing'].includes(b.status));
  const completed = bookings.filter((b) => b.status === 'completed');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.total_amount : 0), 0);

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-400' },
    { label: 'Active Trips', value: active.length, icon: Car, color: 'text-emerald-400' },
    { label: 'Completed', value: completed.length, icon: Star, color: 'text-yellow-400' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'text-brand-400' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-black text-white">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Here's your rental activity overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5 stat-glow">
              <s.icon size={20} className={s.color} />
              <p className="text-2xl font-black text-white mt-3">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/cars" className="glass rounded-2xl p-6 border border-white/5 group card-hover flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
              <Car size={22} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">Browse Cars</h3>
              <p className="text-sm text-gray-400">Find your perfect ride</p>
            </div>
            <ArrowRight size={18} className="text-gray-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/drivers" className="glass rounded-2xl p-6 border border-white/5 group card-hover flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Clock size={22} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">Find Drivers</h3>
              <p className="text-sm text-gray-400">Book a professional driver</p>
            </div>
            <ArrowRight size={18} className="text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Active Bookings */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Active Bookings</h2>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1,2].map((i) => <div key={i} className="glass rounded-2xl h-48 animate-pulse border border-white/5" />)}
            </div>
          ) : active.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {active.map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center border border-white/5">
              <p className="text-3xl mb-3">🚗</p>
              <p className="text-gray-400">No active bookings. <Link to="/cars" className="text-brand-400 underline">Browse cars</Link> to get started!</p>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Recent Trips</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completed.slice(0, 4).map((b) => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
