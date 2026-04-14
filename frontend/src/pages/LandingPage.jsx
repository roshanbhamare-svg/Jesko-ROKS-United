/**
 * Jesko — Landing Page
 * Premium hero, features grid, how-it-works, booking modes, and CTA sections.
 */
import { Link } from 'react-router-dom';
import { Car, Users, Shield, Zap, Star, MapPin, ArrowRight, TrendingUp, Clock, Sparkles, ChevronRight } from 'lucide-react';

const FEATURES = [
  { icon: Car, title: 'Smart Booking', desc: 'AI matches you with the perfect car based on preferences, location, and budget.' },
  { icon: Users, title: 'Driver Marketplace', desc: 'Find verified drivers instantly or book on-demand for emergency situations.' },
  { icon: Shield, title: 'Trust Scores', desc: 'Every owner, driver, and renter has a transparent AI-computed trust score.' },
  { icon: TrendingUp, title: 'Passive Income', desc: 'Car owners earn up to ₹80K/month by listing idle vehicles on the platform.' },
  { icon: Clock, title: 'Real-Time Availability', desc: 'Live tracking of car and driver availability with instant booking confirmation.' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'JeskoAI chatbot helps with car recommendations, bookings, and support 24/7.' },
];

const STEPS = [
  { num: '01', title: 'Owner Lists a Car', desc: 'Set your own pricing, availability, and preferences in 2 minutes.' },
  { num: '02', title: 'Driver Registers', desc: 'Verified drivers join the marketplace and set their availability.' },
  { num: '03', title: 'AI Matches Best Option', desc: 'Our AI recommends the ideal car and driver for every user.' },
  { num: '04', title: 'Book & Go', desc: 'Confirm booking, track in real-time, and pay securely.' },
];

const STATS = [
  { value: '₹10B+', label: 'Market Opportunity' },
  { value: '40M+', label: 'Gig Workers in India' },
  { value: '80%', label: 'Cars Sit Idle Daily' },
  { value: '3', label: 'Sided Marketplace' },
];

export default function LandingPage() {
  return (
    <div className="page-enter">
      {/* ══ HERO ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-600/8 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={14} />
            AI-Powered Mobility Ecosystem
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6">
            Rent Smart.
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent">
              Drive Free.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect car owners, drivers, and riders in one intelligent platform.
            Earn from idle cars, find flexible driving jobs, or rent affordable rides powered by AI.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-lg font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 transition-all btn-press flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/cars"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Browse Cars
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center stat-glow border border-white/5">
                <p className="text-2xl md:text-3xl font-black text-brand-400">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Everything You Need
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto">
              A complete mobility platform built for owners, drivers, and riders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 card-hover stat-glow border border-white/5 group">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <f.icon size={22} className="text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════ */}
      <section className="py-24 px-4 bg-dark-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              4 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 glass rounded-2xl p-6 card-hover border border-white/5">
                <div className="text-4xl font-black text-brand-500/30 shrink-0">{s.num}</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3-SIDED MARKETPLACE ══════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-3">For Everyone</p>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              3-Sided Marketplace
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '🚗',
                title: 'Car Owners',
                benefits: ['List cars in 2 minutes', 'Set custom pricing', 'Earn 80% per booking', 'Real-time tracking dashboard'],
                cta: 'Start Earning',
                link: '/register',
              },
              {
                emoji: '🧑‍✈️',
                title: 'Drivers',
                benefits: ['Register independently', 'Set your availability', 'Accept/reject freely', 'Earn ₹800+/day per trip'],
                cta: 'Join as Driver',
                link: '/register',
              },
              {
                emoji: '👤',
                title: 'Users',
                benefits: ['Rent with/without driver', 'Flexible booking modes', 'AI recommendations', 'Secure & transparent'],
                cta: 'Book a Car',
                link: '/cars',
              },
            ].map((card, i) => (
              <div key={i} className="glass rounded-2xl p-8 card-hover border border-white/5 text-center group">
                <p className="text-5xl mb-4">{card.emoji}</p>
                <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                <ul className="space-y-2 text-sm text-gray-400 mb-6">
                  {card.benefits.map((b, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-brand-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500/10 text-brand-400 font-semibold hover:bg-brand-500/20 transition-colors text-sm"
                >
                  {card.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════ */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Jesko</span>
            <span className="text-xs text-gray-500 ml-2">by ROKS United</span>
          </div>
          <p className="text-sm text-gray-500">
            Built by Roshan Bhamare, Om Patil, Kaustubh Desale, Satvik Kekane
          </p>
          <p className="text-xs text-gray-600">© 2026 Jesko. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
