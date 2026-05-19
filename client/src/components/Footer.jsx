import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Members', path: '/members' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/5 bg-space-900/80 backdrop-blur-sm mt-20">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="absolute inset-0 bg-primary/10 rounded-xl blur-sm" />
                <img
                  src="/robonixx_logo.jpeg"
                  alt="Robonixx logo"
                  className="relative w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-bold text-xl gradient-text tracking-wider">
                ROBONIXX
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-5">
              A premier IoT & Robotics club empowering students to build,
              innovate, and lead in the world of intelligent systems and
              connected technology.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                {
                  icon: Instagram,
                  href: "https://www.instagram.com/robonixx.bcet_/",
                  label: "Instagram",
                },
                {
                  icon: Linkedin,
                  href: "https://www.linkedin.com/company/robonixx-bcet/posts/?feedView=all",
                  label: "LinkedIn",
                },
                {
                  icon: Github,
                  href: "https://github.com/robonixbcet-cpu",
                  label: "GitHub",
                },
                {
                  icon: Mail,
                  href: "mailto:robonix.bcet@gmail.com",
                  label: "Email",
                },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg glass text-slate-400 hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-xs font-bold text-primary tracking-widest uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-display text-xs font-bold text-primary tracking-widest uppercase mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Robonixx Room , CST Block , Bengal College of Engineering &
                  Technology , India
                </span>
              </li>
              <li>
                <a
                  href="mailto:robonixx@college.edu"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  robonix.bcet@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  +91 9264144666
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 font-mono">
            © {year} Robonixx Club. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Systems Online
          </div>
        </div>
      </div>
    </footer>
  );
}
