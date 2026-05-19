import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Globe, User } from 'lucide-react';

const ROLE_COLORS = {
  president: 'from-yellow-400/20 to-amber-400/10 border-yellow-400/30',
  'vice-president': 'from-primary/20 to-accent/10 border-primary/30',
  'tech-lead': 'from-violet-400/20 to-purple-400/10 border-violet-400/30',
  secretary: 'from-teal-400/20 to-cyan-400/10 border-teal-400/30',
  treasurer: 'from-emerald-400/20 to-green-400/10 border-emerald-400/30',
  'media-head': 'from-rose-400/20 to-pink-400/10 border-rose-400/30',
  'event-head': 'from-orange-400/20 to-amber-400/10 border-orange-400/30',
};

export default function MemberCard({ member, index = 0 }) {
  const { name, role, batch, image, shortBio, socialLinks, isCoreTeam, coreRole } = member;
  const gradientClass = ROLE_COLORS[coreRole] || 'from-space-700/50 to-space-800/50 border-white/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div className={`relative glass rounded-2xl p-5 card-hover h-full flex flex-col items-center text-center bg-gradient-to-b ${gradientClass} border`}>
        {/* Core team badge */}
        {isCoreTeam && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 capitalize">
              {coreRole?.replace('-', ' ') || 'Core'}
            </span>
          </div>
        )}

        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-space-700 ring-2 ring-white/10 group-hover:ring-primary/30 transition-all">
            {image ? (
              <img
                src={image}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-space-700">
                <User className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>
          {isCoreTeam && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-glow-sm">
              <span className="text-white text-xs font-bold">★</span>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors mb-1">
          {name}
        </h3>
        <p className="text-xs text-accent/80 font-medium mb-1">{role}</p>
        <span className="text-xs text-slate-500 font-mono mb-3">Batch '{batch}</span>

        {shortBio && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {shortBio}
          </p>
        )}

        {/* Social links */}
        {socialLinks && (
          <div className="flex items-center gap-2 mt-auto">
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-slate-400 transition-all">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-slate-400 transition-all">
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-slate-400 transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {socialLinks.portfolio && (
              <a href={socialLinks.portfolio} target="_blank" rel="noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-slate-400 transition-all">
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
