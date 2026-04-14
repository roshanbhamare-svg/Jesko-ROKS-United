/**
 * Jesko — Driver Card Component
 * Shows driver profile with rating, score, and availability.
 */
import { Star, MapPin, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function DriverCard({ driver, onSelect }) {
  const scoreGrade = driver.driver_score >= 85 ? 'A' : driver.driver_score >= 70 ? 'B' : driver.driver_score >= 50 ? 'C' : 'D';
  const gradeColors = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-red-400' };

  return (
    <div className="glass rounded-2xl p-5 card-hover stat-glow border border-white/5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xl font-bold shrink-0">
          {driver.user?.name?.charAt(0)?.toUpperCase() || 'D'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white truncate">
              {driver.user?.name || `Driver ${driver.id?.slice(0, 6)}`}
            </h3>
            {driver.is_verified && (
              <Shield size={14} className="text-blue-400 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm">
              <Star size={13} className="text-yellow-500 fill-yellow-500" />
              <span className="text-white font-medium">{driver.rating?.toFixed(1)}</span>
            </span>
            <span className="text-xs text-gray-500">{driver.total_trips} trips</span>
            <span className={`text-xs font-bold ${gradeColors[scoreGrade]}`}>
              Grade {scoreGrade}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <MapPin size={12} className="text-brand-500" />
            {driver.current_location || 'Location N/A'}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{driver.experience_years}y exp</span>
            <span>•</span>
            <span>{(driver.acceptance_rate * 100).toFixed(0)}% accept</span>
          </div>
        </div>

        {/* Availability */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className={`flex items-center gap-1 text-xs font-semibold ${driver.is_available ? 'text-emerald-400' : 'text-gray-500'}`}>
            {driver.is_available ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {driver.is_available ? 'Available' : 'Busy'}
          </span>
          {onSelect && driver.is_available && (
            <button
              onClick={() => onSelect(driver)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
            >
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
