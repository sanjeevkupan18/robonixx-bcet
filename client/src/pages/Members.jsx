import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MemberCard from '../components/MemberCard';
import { MemberCardSkeleton } from '../components/ui/Skeletons';
import { membersAPI } from '../utils/api';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activeBatch, setActiveBatch] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membersAPI.getBatches().then(({ data }) => setBatches(data.batches)).catch(() => {});
    membersAPI.getAll().then(({ data }) => { setMembers(data.members); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = members.filter(m => {
    const batchMatch = activeBatch === 'all' || m.batch === activeBatch;
    const searchMatch = search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    return batchMatch && searchMatch;
  });

  // Group by batch
  const grouped = filtered.reduce((acc, m) => {
    const key = m.batch;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  // Core team first
  const coreTeam = filtered.filter(m => m.isCoreTeam);
  const regularByBatch = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <Helmet><title>Members — Robonixx</title></Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg" />
        <div className="section-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="tag mb-4 inline-block">The People</span>
            <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
              Our <span className="gradient-text">Members</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Meet the brilliant minds driving innovation at Robonixx — engineers, designers, and builders united by a passion for technology.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-8">
        <div className="section-container">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search members by name or role..."
                value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
          </div>

          {/* Batch tabs */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            <button onClick={() => setActiveBatch('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeBatch === 'all' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              All Batches
            </button>
            {batches.map(batch => (
              <button key={batch} onClick={() => setActiveBatch(batch)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all ${activeBatch === batch ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                '{batch}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <MemberCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No members found.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Core team section */}
              {activeBatch === 'all' && coreTeam.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
                    <span className="tag">⭐ Core Team</span>
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {coreTeam.map((m, i) => <MemberCard key={m._id} member={m} index={i} />)}
                  </div>
                </div>
              )}

              {/* Members by batch */}
              {activeBatch === 'all' ? (
                regularByBatch.map(([batch, batchMembers]) => (
                  <div key={batch}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                      <span className="font-mono text-xs text-slate-500 border border-white/10 px-3 py-1 rounded-full">
                        Batch '{batch} — {batchMembers.length} members
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {batchMembers.map((m, i) => <MemberCard key={m._id} member={m} index={i} />)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map((m, i) => <MemberCard key={m._id} member={m} index={i} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
