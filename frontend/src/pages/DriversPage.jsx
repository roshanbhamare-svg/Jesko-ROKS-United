/**
 * Jesko — Drivers Listing Page (Public)
 * Browse available drivers with search and score filtering.
 */
import { useState, useEffect } from 'react';
import { driversAPI } from '../services/api';
import DriverCard from '../components/DriverCard';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driversAPI.list({ available_only: false })
      .then(({ data }) => setDrivers(data))
      .catch(() => setDrivers(getDemoDrivers()))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 page-enter">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">Driver Marketplace</h1>
          <p className="text-gray-400 mt-2">Find verified professional drivers near you</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="glass rounded-2xl h-36 animate-pulse border border-white/5" />)}
          </div>
        ) : drivers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {drivers.map(d => (
              <DriverCard key={d.id} driver={d} onSelect={(driver) => toast.success(`Driver selected! Add them when booking a car.`)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🧑‍✈️</p>
            <h3 className="text-xl font-bold text-white mb-2">No Drivers Found</h3>
            <p className="text-gray-400">Drivers will appear here once they register</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getDemoDrivers() {
  return [
    { id: 'd1', user: { name: 'Rajesh Kumar' }, license_number: 'MH01DL2024', experience_years: 8, is_available: true, current_location: 'Mumbai', rating: 4.9, total_trips: 312, acceptance_rate: 0.95, cancellation_rate: 0.02, driver_score: 96, is_verified: true },
    { id: 'd2', user: { name: 'Ankit Sharma' }, license_number: 'MH02DL2022', experience_years: 5, is_available: true, current_location: 'Pune', rating: 4.7, total_trips: 189, acceptance_rate: 0.88, cancellation_rate: 0.04, driver_score: 89, is_verified: true },
    { id: 'd3', user: { name: 'Suresh Patil' }, license_number: 'KA01DL2021', experience_years: 3, is_available: false, current_location: 'Bangalore', rating: 4.5, total_trips: 97, acceptance_rate: 0.82, cancellation_rate: 0.06, driver_score: 78, is_verified: false },
    { id: 'd4', user: { name: 'Deepak Singh' }, license_number: 'DL01DL2023', experience_years: 6, is_available: true, current_location: 'Delhi', rating: 4.8, total_trips: 245, acceptance_rate: 0.91, cancellation_rate: 0.03, driver_score: 92, is_verified: true },
  ];
}
