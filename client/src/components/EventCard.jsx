import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  workshop: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  bootcamp: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  event: 'text-primary bg-primary/10 border-primary/20',
  seminar: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  competition: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

export default function EventCard({ event, index = 0 }) {
  const { title, slug, shortDescription, date, venue, category, status, image, featured } = event;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.event;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group"
    >
      <Link to={`/events/${slug || event._id}`}>
        <div className="glass rounded-2xl overflow-hidden card-hover border border-white/5 hover:border-primary/20 h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-space-800">
            {image ? (
              <img
                src={image}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="grid-bg absolute inset-0 opacity-50" />
                <span className="relative font-display text-4xl font-black text-white/10">RBX</span>
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-space-900/90 via-transparent to-transparent" />

            {/* Status + Featured badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={`badge-${status}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === 'upcoming' ? 'bg-emerald-400' : status === 'ongoing' ? 'bg-amber-400' : 'bg-slate-400'
                } animate-pulse`} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              {featured && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                  ⭐ Featured
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Category tag */}
            <span className={`inline-flex items-center self-start px-2.5 py-1 text-xs font-medium border rounded-full mb-3 capitalize ${categoryColor}`}>
              {category}
            </span>

            <h3 className="font-display font-bold text-base text-white group-hover:text-primary transition-colors mb-2 line-clamp-2">
              {title}
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
              {shortDescription}
            </p>

            {/* Meta */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{format(new Date(date), 'MMM d, yyyy')}</span>
              </div>
              {venue && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="truncate">{venue}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-slate-500 font-mono">
                {format(new Date(date), 'EEE, MMM d')}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                Know More <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
