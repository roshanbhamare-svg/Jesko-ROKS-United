/**
 * Jesko — Booking Page
 * Allows users to create a booking for a specific car with date selection and mode choice.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Car, Users as UsersIcon, Star, Fuel, Settings, ArrowRight } from 'lucide-react';
import { carsAPI, bookingsAPI, driversAPI } from '../services/api';
import DriverCard from '../components/DriverCard';
import toast from 'react-hot-toast';

const MODES = [
  { value: 'self_drive', label: '🚗 Self Drive', desc: 'Drive the car yourself' },
  { value: 'driver_assisted', label: '🧑‍✈️ With Driver', desc: 'Professional driver (₹800/day)' },
  { value: 'emergency', label: '🚨 Emergency', desc: 'On-demand driver within 30 min' },
];

export default function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    mode: 'self_drive',
    pickup_location: '',
    dropoff_location: '',
    start_date: '',
    end_date: '',
    driver_id: null,
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: carData } = await carsAPI.getById(carId);
        setCar(carData);
        setForm((f) => ({ ...f, pickup_location: carData.location }));
        const { data: driverData } = await driversAPI.list({ available_only: true });
        setDrivers(driverData);
      } catch {
        // Demo fallback
        setCar({
          id: carId, make: 'Toyota', model: 'Camry', year: 2024, price_per_day: 2500,
          location: 'Mumbai', category: 'sedan', fuel_type: 'petrol', transmission: 'automatic',
          seats: 5, rating: 4.8, total_trips: 42, is_available: true,
          image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&h=350&fit=crop',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [carId]);

  const days = form.start_date && form.end_date
    ? Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000))
    : 0;
  const baseAmount = car ? car.price_per_day * days : 0;
  const driverFee = form.mode !== 'self_drive' ? 800 * days : 0;
  const commission = Math.round(baseAmount * 0.10);
  const totalAmount = baseAmount + commission + driverFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!days) return toast.error('Please select valid dates');
    setSubmitting(true);
    try {
      const payload = {
        car_id: carId,
        mode: form.mode,
        pickup_location: form.pickup_location,
        dropoff_location: form.dropoff_location || form.pickup_location,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        driver_id: form.driver_id,
        notes: form.notes,
      };
      await bookingsAPI.create(payload);
      toast.success('Booking created successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">Book This Car</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Car Details - Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl overflow-hidden border border-white/5">
              <img src={car.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=350&fit=crop'} alt={`${car.make} ${car.model}`}
                className="w-full h-52 object-cover" />
              <div className="p-5 space-y-3">
                <h2 className="text-xl font-bold text-white">{car.make} {car.model} <span className="text-gray-500 text-base">({car.year})</span></h2>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-500" />{car.location}</span>
                  <span className="flex items-center gap-1"><Fuel size={12} />{car.fuel_type}</span>
                  <span className="flex items-center gap-1"><Settings size={12} />{car.transmission}</span>
                  <span className="flex items-center gap-1"><UsersIcon size={12} />{car.seats} seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-white">{car.rating}</span>
                  <span className="text-xs text-gray-500">({car.total_trips} trips)</span>
                </div>
                <div className="pt-3 border-t border-white/5">
                  <p className="text-2xl font-black text-brand-400">₹{car.price_per_day.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/day</span></p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            {days > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-white">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400"><span>Base ({days} days × ₹{car.price_per_day})</span><span>₹{baseAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Platform fee (10%)</span><span>₹{commission.toLocaleString()}</span></div>
                  {driverFee > 0 && <div className="flex justify-between text-gray-400"><span>Driver fee ({days} days × ₹800)</span><span>₹{driverFee.toLocaleString()}</span></div>}
                  <hr className="border-white/5" />
                  <div className="flex justify-between text-white font-bold text-base"><span>Total</span><span className="text-brand-400">₹{totalAmount.toLocaleString()}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form - Right */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            {/* Booking Mode */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-white mb-3">Booking Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map((m) => (
                  <button key={m.value} type="button" onClick={() => setForm({ ...form, mode: m.value, driver_id: m.value === 'self_drive' ? null : form.driver_id })}
                    className={`p-3 rounded-xl border text-center transition-all ${form.mode === m.value ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-dark-700 hover:border-white/20'}`}>
                    <p className="text-lg">{m.label.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-white mb-3">Trip Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required min={form.start_date}
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-white mb-3">Locations</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pickup</label>
                  <input type="text" value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} required placeholder="Pickup location"
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Drop-off</label>
                  <input type="text" value={form.dropoff_location} onChange={(e) => setForm({ ...form, dropoff_location: e.target.value })} placeholder="Same as pickup if empty"
                    className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
                </div>
              </div>
            </div>

            {/* Driver selection */}
            {form.mode !== 'self_drive' && (
              <div className="glass rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3">Select Driver</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {drivers.length > 0 ? drivers.map((d) => (
                    <div key={d.id} className={`rounded-xl border p-3 cursor-pointer transition-all ${form.driver_id === d.id ? 'border-brand-500 bg-brand-500/5' : 'border-white/5 hover:border-white/15'}`}
                      onClick={() => setForm({ ...form, driver_id: d.id })}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">Driver {d.id?.slice(0, 6)}</span>
                        <div className="flex items-center gap-1 text-xs"><Star size={12} className="text-yellow-500 fill-yellow-500" />{d.rating?.toFixed(1)}</div>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-500">No drivers available. One will be assigned automatically.</p>}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any special requirements..."
                className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm resize-none" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting || !days}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-base hover:from-brand-600 hover:to-brand-700 transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25">
              {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Confirm Booking — ₹{totalAmount.toLocaleString()} <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
