/**
 * Jesko — Car Card Component
 * Premium card showing car details with hover effects and availability badge.
 */
import { Link } from 'react-router-dom';
import { MapPin, Fuel, Settings, Users, Star } from 'lucide-react';

export default function CarCard({ car }) {
  const placeholderImg = `https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop&q=80`;

  return (
    <Link to={`/cars/${car.id}`} className="block">
      <div className="glass rounded-2xl overflow-hidden card-hover group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={car.image_url || placeholderImg}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
          
          {/* Availability badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
            car.is_available
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {car.is_available ? 'Available' : 'Booked'}
          </div>

          {/* Category tag */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30 capitalize">
            {car.category}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-dark-900/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
              <span className="text-lg font-bold text-brand-400">₹{car.price_per_day.toLocaleString()}</span>
              <span className="text-xs text-gray-400">/day</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-gray-400">{car.year}</p>
          </div>

          {/* Features row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-brand-500" />
              {car.location}
            </span>
            <span className="flex items-center gap-1">
              <Fuel size={12} />
              {car.fuel_type}
            </span>
            <span className="flex items-center gap-1">
              <Settings size={12} />
              {car.transmission}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {car.seats}
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-white">{car.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-gray-500">({car.total_trips} trips)</span>
            </div>
            <span className="text-xs text-brand-400 font-medium group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
