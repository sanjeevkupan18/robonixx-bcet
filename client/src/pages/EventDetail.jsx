import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, ArrowLeft, Clock, ExternalLink, Tag } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageLoader from '../components/ui/PageLoader';
import { eventsAPI } from '../utils/api';

export default function EventDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.getOne(slug).then(({ data }) => setEvent(data.event)).catch(() => {}).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!event) return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-slate-400">Event not found.</p>
        <Link to="/events" className="btn-outline mt-4">Back to Events</Link>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>{event.title} — Robonixx</title></Helmet>
      <Navbar />

      {/* Hero image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-space-800 flex items-center justify-center grid-bg">
            <span className="font-display text-6xl font-black text-white/10">RBX</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-space-900/60 to-transparent" />

        {/* Back button */}
        <Link to="/events" className="absolute top-24 left-4 md:left-8 flex items-center gap-2 text-sm text-slate-300 hover:text-primary glass px-3 py-2 rounded-lg transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
      </div>

      {/* Content */}
      <section className="relative z-10 -mt-10 pb-20">
        <div className="section-container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Status + category */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`badge-${event.status}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'upcoming' ? 'bg-emerald-400' : event.status === 'ongoing' ? 'bg-amber-400' : 'bg-slate-400'} animate-pulse`} />
                {event.status}
              </span>
              <span className="tag capitalize">{event.category}</span>
              {event.featured && <span className="tag text-yellow-400 border-yellow-400/30 bg-yellow-400/10">⭐ Featured</span>}
            </div>

            <h1 className="font-display font-black text-2xl md:text-4xl text-white mb-4">{event.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" />{format(new Date(event.date), 'EEEE, MMM d, yyyy')}</span>
              {event.venue && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent" />{event.venue}</span>}
              {event.registrationDeadline && (
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" />
                  Register by {format(new Date(event.registrationDeadline), 'MMM d')}
                </span>
              )}
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {event.tags.map(tag => <span key={tag} className="tag"># {tag}</span>)}
              </div>
            )}

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2">
                <div className="glass rounded-2xl p-6 mb-6">
                  <h2 className="font-display font-bold text-base text-primary mb-4">About This Event</h2>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{event.fullDescription}</div>
                </div>

                {/* Schedule */}
                {event.schedule?.length > 0 && (
                  <div className="glass rounded-2xl p-6">
                    <h2 className="font-display font-bold text-base text-primary mb-5">Event Schedule</h2>
                    <div className="space-y-4">
                      {event.schedule.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                          className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            {i < event.schedule.length - 1 && <div className="w-px flex-1 bg-primary/20 mt-1" />}
                          </div>
                          <div className="pb-4">
                            <span className="text-xs font-mono text-primary">{item.time}</span>
                            <p className="text-sm text-white font-medium mt-0.5">{item.activity}</p>
                            {item.speaker && <p className="text-xs text-slate-500 mt-0.5">Speaker: {item.speaker}</p>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Registration CTA */}
                {event.registrationLink && event.status === 'upcoming' && (
                  <div className="glass rounded-2xl p-6 glow-border-blue">
                    <h3 className="font-display font-bold text-sm text-white mb-3">Register Now</h3>
                    {event.maxParticipants > 0 && (
                      <p className="text-xs text-slate-400 mb-4">Limited to {event.maxParticipants} participants</p>
                    )}
                    <a href={event.registrationLink} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
                      Register <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Event details card */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-sm text-white mb-4">Event Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-400"><Calendar className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-slate-500">Date</p><p className="text-white text-xs">{format(new Date(event.date), 'EEE, MMM d, yyyy')}</p></div></div>
                    {event.endDate && <div className="flex items-start gap-2 text-slate-400"><Calendar className="w-4 h-4 text-accent mt-0.5" /><div><p className="text-xs text-slate-500">End Date</p><p className="text-white text-xs">{format(new Date(event.endDate), 'EEE, MMM d, yyyy')}</p></div></div>}
                    {event.venue && <div className="flex items-start gap-2 text-slate-400"><MapPin className="w-4 h-4 text-accent mt-0.5" /><div><p className="text-xs text-slate-500">Venue</p><p className="text-white text-xs">{event.venue}</p></div></div>}
                    <div className="flex items-start gap-2 text-slate-400"><Tag className="w-4 h-4 text-primary mt-0.5" /><div><p className="text-xs text-slate-500">Category</p><p className="text-white text-xs capitalize">{event.category}</p></div></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
