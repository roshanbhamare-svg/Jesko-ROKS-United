/**
 * Jesko — Register Page
 * Role-based registration: User / Owner / Driver
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Mail, Lock, User, Phone, ArrowRight, UserCircle, Truck, Crown } from 'lucide-react';

const ROLES = [
  { value: 'user', label: 'Rider', icon: UserCircle, desc: 'Book cars & rides' },
  { value: 'owner', label: 'Owner', icon: Crown, desc: 'List & earn from cars' },
  { value: 'driver', label: 'Driver', icon: Truck, desc: 'Drive & earn money' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      const dest = user.role === 'owner' ? '/owner/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/dashboard';
      navigate(dest);
    } catch { /* handled */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 page-enter">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-brand-600/8 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Car size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Jesko</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Choose your role and get started</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.role === r.value
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-white/10 bg-dark-700 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <r.icon size={20} className="mx-auto mb-1" />
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder-gray-500" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm hover:from-brand-600 hover:to-brand-700 transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-brand-400 font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
