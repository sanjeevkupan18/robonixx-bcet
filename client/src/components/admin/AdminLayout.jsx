import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, Image,
  FileText, MessageSquare, LogOut, Menu, X, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Calendar, label: 'Events', path: '/admin/events' },
  { icon: Users, label: 'Members', path: '/admin/members' },
  { icon: Image, label: 'Gallery', path: '/admin/gallery' },
  { icon: FileText, label: 'Site Content', path: '/admin/content' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
  { icon: ShieldCheck, label: 'Security', path: '/admin/security' },
];

export default function AdminLayout({ children, title }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <img
            src="/robonixx_logo.jpeg"
            alt="Robonixx logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-display font-bold text-sm gradient-text">ROBONIXX</p>
          <p className="text-xs text-slate-600 font-mono">ADMIN</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = path === '/admin' ? pathname === path : pathname.startsWith(path);
          return (
            <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : 'text-slate-500 group-hover:text-white'}`} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-xs">{user?.name?.[0] || 'A'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-space-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-space-900 border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-space-950/80 backdrop-blur-sm z-40 lg:hidden" />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-56 bg-space-900 border-r border-white/5 z-50 flex flex-col lg:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-space-900/80 backdrop-blur-xl border-b border-white/5 h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(v => !v)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-white/10 lg:hidden" />
          <h1 className="font-display font-bold text-sm text-white">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" target="_blank"
              className="text-xs text-slate-500 hover:text-primary transition-colors font-mono">
              ↗ View Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
