/**
 * Jesko — Booking Card Component
 * Displays booking details with status badges and action buttons.
 */
import { Calendar, MapPin, Car, Clock } from 'lucide-react';

const STATUS_COLORS = {
  requested: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ongoing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const MODE_LABELS = {
  self_drive: '🚗 Self Drive',
  driver_assisted: '🧑‍✈️ With Driver',
  emergency: '🚨 Emergency',
};

export default function BookingCard({ booking, onAction }) {
  const startDate = new Date(booking.start_date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const endDate = new Date(booking.end_date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="glass rounded-2xl p-5 space-y-4 card-hover stat-glow border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono">#{booking.id?.slice(0, 8)}</p>
          <p className="text-sm font-medium text-white mt-0.5">{MODE_LABELS[booking.mode]}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin size={14} className="text-brand-500 shrink-0" />
          <span>{booking.pickup_location} → {booking.dropoff_location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={14} className="text-brand-500 shrink-0" />
          <span>{startDate} — {endDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={14} className="text-brand-500 shrink-0" />
          <span>{booking.total_days} day{booking.total_days > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500">Base</p>
          <p className="text-sm font-semibold text-white">₹{booking.base_amount?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-bold text-brand-400">₹{booking.total_amount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      {onAction && booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <div className="flex gap-2 pt-2">
          {booking.status === 'requested' && (
            <>
              <button
                onClick={() => onAction(booking.id, 'accepted')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onAction(booking.id, 'cancelled')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          {booking.status === 'accepted' && (
            <button
              onClick={() => onAction(booking.id, 'ongoing')}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Start Trip
            </button>
          )}
          {booking.status === 'ongoing' && (
            <button
              onClick={() => onAction(booking.id, 'completed')}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
            >
              Complete Trip
            </button>
          )}
        </div>
      )}
    </div>
  );
}
