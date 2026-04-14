/**
 * Jesko — Cars Listing Page
 * Browse and search available cars with filters.
 */
import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { carsAPI } from '../services/api';
import CarCard from '../components/CarCard';

const CATEGORIES = ['all', 'sedan', 'suv', 'hatchback', 'luxury'];

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = { available_only: true };
      if (search) params.location = search;
      if (category !== 'all') params.category = category;
      if (maxPrice) params.max_price = parseFloat(maxPrice);
      const { data } = await carsAPI.search(params);
      setCars(data);
    } catch {
      // Use demo data if API is down
      setCars(getDemoCars());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars();
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">Browse Cars</h1>
          <p className="text-gray-400 mt-2">Find your perfect ride from our curated fleet</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location (e.g. Mumbai, Pune...)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder-gray-500"
            />
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-dark-700 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all md:w-auto"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="glass rounded-2xl p-6 mb-8 animate-fade-in border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Price (₹/day)</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="5000"
                  className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Location</label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="City name"
                  className="w-full px-4 py-2.5 rounded-lg bg-dark-700 border border-white/10 text-white text-sm" />
              </div>
            </div>
            <button onClick={fetchCars} className="mt-4 px-6 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
              Apply Filters
            </button>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-dark-700 text-gray-400 border border-white/5 hover:text-white hover:border-white/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="glass rounded-2xl h-80 animate-pulse border border-white/5">
                <div className="h-48 bg-dark-600 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-2/3 bg-dark-600 rounded" />
                  <div className="h-3 w-1/2 bg-dark-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🚗</p>
            <h3 className="text-xl font-bold text-white mb-2">No Cars Found</h3>
            <p className="text-gray-400">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getDemoCars() {
  return [
    { id: '1', make: 'Toyota', model: 'Camry', year: 2024, category: 'sedan', price_per_day: 2500, location: 'Mumbai', fuel_type: 'petrol', transmission: 'automatic', seats: 5, rating: 4.8, total_trips: 42, is_available: true, image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop' },
    { id: '2', make: 'Hyundai', model: 'Creta', year: 2024, category: 'suv', price_per_day: 3000, location: 'Pune', fuel_type: 'diesel', transmission: 'automatic', seats: 5, rating: 4.6, total_trips: 35, is_available: true, image_url: 'https://images.unsplash.com/photo-1606611013014-625135903069?w=400&h=250&fit=crop' },
    { id: '3', make: 'Maruti', model: 'Swift', year: 2023, category: 'hatchback', price_per_day: 1200, location: 'Mumbai', fuel_type: 'petrol', transmission: 'manual', seats: 5, rating: 4.3, total_trips: 68, is_available: true, image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=250&fit=crop' },
    { id: '4', make: 'BMW', model: '5 Series', year: 2024, category: 'luxury', price_per_day: 8000, location: 'Delhi', fuel_type: 'petrol', transmission: 'automatic', seats: 5, rating: 4.9, total_trips: 15, is_available: true, image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop' },
    { id: '5', make: 'Honda', model: 'City', year: 2024, category: 'sedan', price_per_day: 2200, location: 'Bangalore', fuel_type: 'petrol', transmission: 'automatic', seats: 5, rating: 4.5, total_trips: 51, is_available: true, image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop' },
    { id: '6', make: 'Tata', model: 'Nexon EV', year: 2024, category: 'suv', price_per_day: 3500, location: 'Mumbai', fuel_type: 'electric', transmission: 'automatic', seats: 5, rating: 4.7, total_trips: 22, is_available: true, image_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=250&fit=crop' },
  ];
}
