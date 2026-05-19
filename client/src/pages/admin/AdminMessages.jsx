import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Mail, Clock, CheckCheck, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { contactAPI } from '../../utils/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchMessages = async () => {
    try {
      const params = {};
      if (filter === 'unread') params.read = false;
      if (filter === 'read') params.read = true;
      const { data } = await contactAPI.getAll(params);
      setMessages(data.messages);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, [filter]);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await contactAPI.markRead(msg._id);
        setMessages(ms => ms.map(m => m._id === msg._id ? { ...m, read: true } : m));
      } catch { }
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactAPI.delete(id);
      toast.success('Message deleted');
      setDeleteConfirm(null);
      if (selected?._id === id) setSelected(null);
      fetchMessages();
    } catch { toast.error('Failed to delete'); }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <>
      <Helmet><title>Messages — Robonixx Admin</title></Helmet>
      <AdminLayout title="Contact Messages">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: 'all', label: `All (${messages.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'read', label: 'Read' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Messages list */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass rounded-2xl p-6 text-center text-slate-400 text-sm">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No messages yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map(msg => (
                  <motion.div key={msg._id} layout
                    onClick={() => openMessage(msg)}
                    className={`glass rounded-xl p-4 cursor-pointer transition-all border ${
                      selected?._id === msg._id ? 'border-primary/30 bg-primary/5' :
                      !msg.read ? 'border-white/10 hover:border-white/20' : 'border-white/5 hover:border-white/10 opacity-70'
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-medium truncate ${msg.read ? 'text-slate-400' : 'text-white'}`}>{msg.name}</p>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5 animate-pulse" />}
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">{msg.subject || 'General Inquiry'}</p>
                    <p className="text-xs text-slate-600 truncate">{msg.message}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-xs text-slate-600 font-mono">{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="glass rounded-2xl border border-white/5 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-start justify-between px-5 py-4 border-b border-white/5">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{selected.subject || 'General Inquiry'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">{selected.name}</span>
                        <a href={`mailto:${selected.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />{selected.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400" title="Mark as read" />
                      <button onClick={() => setDeleteConfirm(selected._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs text-slate-500 font-mono">{format(new Date(selected.createdAt), 'EEEE, MMM d yyyy — h:mm a')}</span>
                    </div>
                    <div className="bg-space-800/50 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </div>

                    {/* Reply button */}
                    <div className="mt-5">
                      <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message to Robonixx'}`}
                        className="btn-outline text-sm">
                        <Mail className="w-4 h-4" /> Reply via Email
                      </a>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl border border-white/5 p-10 text-center h-full flex flex-col items-center justify-center min-h-64">
                  <MessageSquare className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">Select a message to view</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/80 backdrop-blur-sm px-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-space-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center">
                <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-white mb-2">Delete Message?</h3>
                <p className="text-slate-400 text-sm mb-5">This action is permanent and cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </AdminLayout>
    </>
  );
}
