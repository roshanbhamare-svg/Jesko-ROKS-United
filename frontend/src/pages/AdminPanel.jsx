/**
 * Jesko — Admin Panel
 * Platform-wide stats, user management, and driver verification.
 */
import { useState, useEffect } from 'react';
import { Users, Car, BarChart2, DollarSign, Shield, ToggleRight } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const ROLE_COLORS = { user: 'text-blue-400', owner: 'text-purple-400', driver: 'text-emerald-400', admin: 'text-brand-400' };

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const load = async () => {
    try {
      const [{ data: statsData }, { data: usersData }] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch {
      // Demo fallback
      setStats({ total_users: 128, total_cars: 45, total_drivers: 33, total_bookings: 312, completed_bookings: 267, platform_revenue: 84650, completion_rate: 85.6 });
      setUsers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleUser = async (userId) => {
    try {
      await adminAPI.toggleUser(userId);
      toast.success('User status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const verifyDriver = async (driverId) => {
    try {
      await adminAPI.verifyDriver(driverId);
      toast.success('Driver verified ✅');
      load();
    } catch { toast.error('Failed'); }
  };

  const TABS = ['overview', 'users'];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Platform management & analytics</p>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold">
            🔐 Admin Access
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-400 border border-white/5 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* KPI Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="glass rounded-2xl h-32 animate-pulse border border-white/5" />)}
              </div>
            ) : stats && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-400' },
                    { label: 'Listed Cars', value: stats.total_cars, icon: Car, color: 'text-purple-400' },
                    { label: 'Drivers', value: stats.total_drivers, icon: Shield, color: 'text-emerald-400' },
                    { label: 'Total Bookings', value: stats.total_bookings, icon: BarChart2, color: 'text-yellow-400' },
                  ].map((s, i) => (
                    <div key={i} className="glass rounded-2xl p-5 border border-white/5 stat-glow">
                      <s.icon size={20} className={s.color} />
                      <p className="text-3xl font-black text-white mt-3">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue & Completion */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <DollarSign size={20} className="text-emerald-400" />
                    <p className="text-4xl font-black text-white mt-3">₹{stats.platform_revenue?.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">Platform Commission Revenue</p>
                    <div className="mt-4 flex gap-6 text-sm">
                      <div><p className="text-xs text-gray-500">Completed</p><p className="text-white font-bold">{stats.completed_bookings}</p></div>
                      <div><p className="text-xs text-gray-500">Completion Rate</p><p className="text-emerald-400 font-bold">{stats.completion_rate}%</p></div>
                    </div>
                  </div>

                  {/* Commission breakdown */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4">Revenue Model</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Platform Fee (10%)', pct: 10, color: 'bg-brand-500' },
                        { label: 'Owner Share (80%)', pct: 80, color: 'bg-blue-500' },
                        { label: 'Driver Share (85% of fee)', pct: 8.5, color: 'bg-emerald-500' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{item.label}</span><span>{item.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-base font-bold text-white">All Users ({users.length})</h2>
            </div>
            {users.length > 0 ? (
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${u.is_active ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => toggleUser(u.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <ToggleRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                <p>No users found. Make sure the backend is running.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
