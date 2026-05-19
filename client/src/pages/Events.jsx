import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import { EventCardSkeleton } from '../components/ui/Skeletons';
import { eventsAPI } from '../utils/api';

const TABS = ['all', 'upcoming', 'past', 'ongoing'];
const CATEGORIES = ['all', 'event', 'workshop', 'bootcamp', 'seminar', 'competition'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (activeTab !== 'all') params.status = activeTab;
        if (category !== 'all') params.category = category;
        const { data } = await eventsAPI.getAll(params);
        setEvents(data.events);
        setTotalPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeTab, category, page]);

  const filtered = events.filter(e =>
    search === '' || e.title.toLowerCase().includes(search.toLowerCase()) || e.shortDescription?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Events — Robonixx</title></Helmet>
      <Navbar />

      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg" />
        <div className="section-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="tag mb-4 inline-block">Activities</span>
            <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
              <span className="gradient-text">Events</span> & Workshops
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              From intensive bootcamps to competitive hackathons — explore all Robonixx activities.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-8">
        <div className="section-container">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category */}
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="input-field sm:w-44 capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'all' ? '🔭 All Events' : tab === 'upcoming' ? '🚀 Upcoming' : tab === 'past' ? '📁 Past' : '⚡ Ongoing'}
              </button>
            ))}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No events found. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((event, i) => <EventCard key={event._id} event={event} index={i} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === p ? 'bg-primary text-space-900 font-bold' : 'glass text-slate-400 hover:text-white'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
