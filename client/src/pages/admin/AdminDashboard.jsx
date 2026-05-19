import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, Users, Image, MessageSquare, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import { authAPI } from '../../utils/api';

const COLORS = ['#5DADE2', '#A29BFE', '#34d399', '#f59e0b', '#f87171'];

const StatCard = ({ icon: Icon, label, value, color, link, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Link to={link || '#'} className="block">
      <div className="glass rounded-2xl p-5 card-hover border border-white/5 hover:border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </div>
        <p className="font-display font-black text-3xl text-white mb-1">{value ?? '—'}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </Link>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.stats().then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const batchChartData = stats?.membersByBatch?.map(b => ({ name: `'${b._id}`, count: b.count })) || [];
  const eventPieData = [
    { name: 'Upcoming', value: stats?.stats?.upcomingEvents || 0 },
    { name: 'Past', value: (stats?.stats?.totalEvents || 0) - (stats?.stats?.upcomingEvents || 0) },
  ];

  return (
    <>
      <Helmet><title>Dashboard — Robonixx Admin</title></Helmet>
      <AdminLayout title="Dashboard">

        <div className="mb-6">
          <h2 className="font-display font-bold text-lg text-white">Overview</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time stats for your club website</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Total Events" value={stats?.stats?.totalEvents} color="bg-primary/10 text-primary" link="/admin/events" delay={0} />
          <StatCard icon={TrendingUp} label="Upcoming Events" value={stats?.stats?.upcomingEvents} color="bg-emerald-400/10 text-emerald-400" link="/admin/events" delay={0.05} />
          <StatCard icon={Users} label="Active Members" value={stats?.stats?.totalMembers} color="bg-accent/10 text-accent" link="/admin/members" delay={0.1} />
          <StatCard icon={MessageSquare} label="Unread Messages" value={stats?.stats?.unreadMessages} color="bg-amber-400/10 text-amber-400" link="/admin/messages" delay={0.15} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Members by batch bar chart */}
          <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-white mb-5">Members by Batch</h3>
            {batchChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={batchChartData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1F2A44', border: '1px solid rgba(93,173,226,0.2)', borderRadius: '8px', fontSize: '12px', fontFamily: 'Syne' }}
                    cursor={{ fill: 'rgba(93,173,226,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#5DADE2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No member data yet</div>
            )}
          </div>

          {/* Event status pie */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-white mb-5">Event Status</h3>
            {stats?.stats?.totalEvents > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={eventPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {eventPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1F2A44', border: '1px solid rgba(93,173,226,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {eventPieData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-white font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No events yet</div>
            )}
          </div>
        </div>

        {/* Recent events table */}
        {stats?.recentEvents?.length > 0 && (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="font-display font-bold text-sm text-white">Recent Events</h3>
              <Link to="/admin/events" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-white/5">
              {stats.recentEvents.map((evt) => (
                <div key={evt._id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">{evt.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500 font-mono">{format(new Date(evt.date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <span className={`badge-${evt.status} text-xs`}>
                    <span className={`w-1 h-1 rounded-full ${evt.status === 'upcoming' ? 'bg-emerald-400' : evt.status === 'ongoing' ? 'bg-amber-400' : 'bg-slate-400'} animate-pulse`} />
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </AdminLayout>
    </>
  );
}
