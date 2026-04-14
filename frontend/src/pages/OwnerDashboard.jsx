/**
 * Jesko — Owner Dashboard
 * Manage cars, view bookings for owned vehicles, and track earnings.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Car, DollarSign, TrendingUp, BarChart2, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { carsAPI, bookingsAPI } from '../services/api';
import BookingCard from '../components/BookingCard';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCar, setShowAddCar] = useState(false);
  const [carForm, setCarForm] = useState({
    make: '', model: '', year: 2024, color: '', license_plate: '',
    category: 'sedan', price_per_day: '', location: '',
    fuel_type: 'petrol', transmission: 'manual', seats: 5, description: '',
    image_url: '',
  });

  const load = async () => {
    try {
      const [{ data: carsData }, { data: bookingsData }] = await Promise.all([
        carsAPI.getMyCars(),
        bookingsAPI.list(),
      ]);
      setCars(carsData);
      setBookings(bookingsData);
    } catch {
      setCars([]); setBookings([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.base_amount * 0.8, 0);
  const pendingBookings = bookings.filter(b => b.status === 'requested');

  const stats = [
    { label: 'Total Cars', value: cars.length, icon: Car, color: 'text-blue-400' },
    { label: 'Total Bookings', value: bookings.length, icon: BarChart2, color: 'text-purple-400' },
    { label: 'Pending Approvals', value: pendingBookings.length, icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Earnings (80%)', value: `₹${Math.round(totalEarnings).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
  ];

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await carsAPI.create({ ...carForm, year: parseInt(carForm.year), price_per_day: parseFloat(carForm.price_per_day), seats: parseInt(carForm.seats) });
      toast.success('Car listed successfully! 🚗');
      setShowAddCar(false);
      setCarForm({ make: '', model: '', year: 2024, color: '', license_plate: '', category: 'sedan', price_per_day: '', location: '', fuel_type: 'petrol', transmission: 'manual', seats: 5, description: '', image_url: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add car'); }
  };

  const toggleAvailability = async (car) => {
    try {
      await carsAPI.update(car.id, { is_available: !car.is_available });
      toast.success(`Car marked as ${!car.is_available ? 'available' : 'unavailable'}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const deleteCar = async (carId) => {
    if (!confirm('Delete this car listing?')) return;
    try { await carsAPI.delete(carId); toast.success('Car removed'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      toast.success(`Booking ${status}`);
      load();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Owner Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your fleet and track earnings</p>
          </div>
          <button onClick={() => setShowAddCar(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 transition-all btn-press">
            <Plus size={18} /> Add Car
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5 stat-glow">
              <s.icon size={20} className={s.color} />
              <p className="text-2xl font-black text-white mt-3">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add Car Modal */}
        {showAddCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-strong rounded-2xl p-8 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">List a New Car</h2>
                <button onClick={() => setShowAddCar(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
              </div>
              <form onSubmit={handleAddCar} className="grid grid-cols-2 gap-4">
                {[
                  { key: 'make', label: 'Make', placeholder: 'Toyota' },
                  { key: 'model', label: 'Model', placeholder: 'Camry' },
                  { key: 'year', label: 'Year', type: 'number', placeholder: '2024' },
                  { key: 'color', label: 'Color', placeholder: 'White' },
                  { key: 'license_plate', label: 'License Plate', placeholder: 'MH01AB1234' },
                  { key: 'price_per_day', label: 'Price/Day (₹)', type: 'number', placeholder: '2500' },
                  { key: 'location', label: 'Location', placeholder: 'Mumbai' },
                  { key: 'seats', label: 'Seats', type: 'number', placeholder: '5' },
                  { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
                ].map((f) => (
                  <div key={f.key} className={f.key === 'image_url' ? 'col-span-2' : ''}>
                    <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                    <input type={f.type || 'text'} value={carForm[f.key]} onChange={(e) => setCarForm({ ...carForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder} required={['make','model','year','license_plate','price_per_day','location'].includes(f.key)}
                      className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
                  </div>
                ))}
                {/* Selects */}
                {[
                  { key: 'category', label: 'Category', options: ['sedan','suv','hatchback','luxury'] },
                  { key: 'fuel_type', label: 'Fuel', options: ['petrol','diesel','electric','hybrid'] },
                  { key: 'transmission', label: 'Transmission', options: ['manual','automatic'] },
                ].map((s) => (
                  <div key={s.key}>
                    <label className="block text-xs text-gray-400 mb-1">{s.label}</label>
                    <select value={carForm[s.key]} onChange={(e) => setCarForm({ ...carForm, [s.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm">
                      {s.options.map(o => <option key={o} value={o} className="bg-dark-700 capitalize">{o}</option>)}
                    </select>
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea value={carForm.description} onChange={(e) => setCarForm({ ...carForm, description: e.target.value })} rows={2}
                    placeholder="Brief description of your car..." className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm resize-none" />
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-sm hover:from-brand-600 hover:to-brand-700 transition-all btn-press">List Car</button>
                  <button type="button" onClick={() => setShowAddCar(false)} className="flex-1 py-3 rounded-xl bg-dark-700 border border-white/10 text-gray-300 font-semibold text-sm hover:bg-dark-600 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Cars */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">My Cars ({cars.length})</h2>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-40 animate-pulse border border-white/5" />)}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car) => (
                <div key={car.id} className="glass rounded-2xl p-5 border border-white/5 stat-glow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{car.make} {car.model}</h3>
                      <p className="text-xs text-gray-500">{car.year} • {car.license_plate}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${car.is_available ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                      {car.is_available ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xl font-black text-brand-400">₹{car.price_per_day.toLocaleString()}<span className="text-xs text-gray-500 font-normal">/day</span></p>
                  <p className="text-xs text-gray-500 mt-1">{car.location} • {car.total_trips} trips</p>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                    <button onClick={() => toggleAvailability(car)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors">
                      {car.is_available ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} />}
                      {car.is_available ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => deleteCar(car.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-10 text-center border border-white/5">
              <p className="text-4xl mb-3">🚗</p>
              <p className="text-gray-400">No cars listed yet. <button onClick={() => setShowAddCar(true)} className="text-brand-400 underline">Add your first car!</button></p>
            </div>
          )}
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Pending Approvals ({pendingBookings.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pendingBookings.map(b => <BookingCard key={b.id} booking={b} onAction={handleBookingAction} />)}
            </div>
          </div>
        )}

        {/* All Bookings */}
        {bookings.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">All Bookings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {bookings.slice(0, 6).map(b => <BookingCard key={b.id} booking={b} onAction={handleBookingAction} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
