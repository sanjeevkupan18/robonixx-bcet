import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2, X, Upload, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { eventsAPI } from '../../utils/api';
import { IMAGE_ACCEPT } from '../../utils/media';

const EMPTY = {
  title: '', shortDescription: '', fullDescription: '', date: '', endDate: '',
  venue: '', category: 'event', registrationLink: '', registrationDeadline: '',
  maxParticipants: '', featured: false, tags: '', schedule: '',
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const fetchEvents = async () => {
    try {
      const { data } = await eventsAPI.getAll({ limit: 50 });
      setEvents(data.events);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openAdd = () => { setForm(EMPTY); setImage(null); setImagePreview(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (evt) => {
    setForm({
      title: evt.title || '',
      shortDescription: evt.shortDescription || '',
      fullDescription: evt.fullDescription || '',
      date: evt.date ? new Date(evt.date).toISOString().slice(0, 16) : '',
      endDate: evt.endDate ? new Date(evt.endDate).toISOString().slice(0, 16) : '',
      venue: evt.venue || '',
      category: evt.category || 'event',
      registrationLink: evt.registrationLink || '',
      registrationDeadline: evt.registrationDeadline ? new Date(evt.registrationDeadline).toISOString().slice(0, 10) : '',
      maxParticipants: evt.maxParticipants ?? '',
      featured: Boolean(evt.featured),
      tags: Array.isArray(evt.tags) ? evt.tags.join(', ') : '',
      schedule: Array.isArray(evt.schedule) ? JSON.stringify(evt.schedule, null, 2) : '',
    });
    setImagePreview(evt.image || '');
    setImage(null);
    setModal({ open: true, mode: 'edit', data: evt });
  };

  const closeModal = () => setModal({ open: false, mode: 'add', data: null });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      const fields = { ...form };
      // Parse tags and schedule
      if (fields.tags) { try { const t = fields.tags.split(',').map(s => s.trim()).filter(Boolean); fd.append('tags', JSON.stringify(t)); } catch { } }
      if (fields.schedule) { try { JSON.parse(fields.schedule); fd.append('schedule', fields.schedule); } catch { } }
      delete fields.tags; delete fields.schedule; delete fields.gallery; delete fields.image; delete fields.imagePublicId; delete fields.__v; delete fields._id; delete fields.createdAt; delete fields.updatedAt; delete fields.slug;
      Object.entries(fields).forEach(([k, v]) => { if (v !== '' && v !== undefined) fd.append(k, v); });
      if (image) fd.append('image', image);

      if (modal.mode === 'add') {
        await eventsAPI.create(fd);
        toast.success('Event created!');
      } else {
        await eventsAPI.update(modal.data._id, fd);
        toast.success('Event updated!');
      }
      closeModal();
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      setDeleteConfirm(null);
      fetchEvents();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = events.filter(e => search === '' || e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Helmet><title>Manage Events — Robonixx Admin</title></Helmet>
      <AdminLayout title="Manage Events">

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 text-sm" />
          </div>
          <button onClick={openAdd} className="btn-primary flex-shrink-0 shadow-glow-blue">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        {/* Events table */}
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No events yet. Click "Add Event" to get started.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-500 font-mono">
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(evt => (
                    <tr key={evt._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium truncate max-w-[200px]">{evt.title}</p>
                        {evt.featured && <span className="text-xs text-yellow-400">⭐ Featured</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-400 font-mono text-xs">{format(new Date(evt.date), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className="tag capitalize text-xs">{evt.category}</span></td>
                      <td className="px-4 py-3"><span className={`badge-${evt.status} text-xs`}>{evt.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(evt)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(evt._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {modal.open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center bg-space-950/80 backdrop-blur-sm overflow-y-auto py-8 px-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-space-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="font-display font-bold text-base text-white">{modal.mode === 'add' ? 'Add New Event' : 'Edit Event'}</h2>
                  <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Image upload */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-mono">Event Image</label>
                    <div onClick={() => fileRef.current.click()}
                      className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-primary/30 transition-all">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                      ) : (
                        <div className="py-4"><Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" /><p className="text-xs text-slate-500">Click to upload image</p></div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} onChange={handleImageChange} className="hidden" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Title *</label>
                      <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field text-sm" required placeholder="Event title" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Start Date *</label>
                      <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field text-sm" required />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">End Date</label>
                      <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm">
                        {['event','workshop','bootcamp','seminar','competition'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Venue</label>
                      <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="input-field text-sm" placeholder="Location" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Short Description *</label>
                      <textarea value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} className="input-field text-sm resize-none" rows={2} required placeholder="Brief summary (max 300 chars)" maxLength={300} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Full Description *</label>
                      <textarea value={form.fullDescription} onChange={e => setForm(f => ({ ...f, fullDescription: e.target.value }))} className="input-field text-sm resize-none" rows={5} required placeholder="Full event details..." />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Registration Link</label>
                      <input value={form.registrationLink} onChange={e => setForm(f => ({ ...f, registrationLink: e.target.value }))} className="input-field text-sm" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Max Participants</label>
                      <input type="number" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} className="input-field text-sm" placeholder="0 = unlimited" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Tags (comma separated)</label>
                      <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field text-sm" placeholder="iot, robotics, workshop" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">Schedule (JSON array)</label>
                      <textarea value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} className="input-field text-sm resize-none font-mono text-xs" rows={4}
                        placeholder={`[{"time":"9:00 AM","activity":"Registration","speaker":""},...]`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-primary" />
                      <label htmlFor="featured" className="text-xs text-slate-400 font-mono">Mark as Featured</label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="btn-ghost text-sm">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary shadow-glow-blue disabled:opacity-60">
                      {submitting ? 'Saving...' : modal.mode === 'add' ? 'Create Event' : 'Update Event'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/80 backdrop-blur-sm px-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-space-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
                <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-white mb-2">Delete Event?</h3>
                <p className="text-slate-400 text-sm mb-5">This action cannot be undone. The event and its image will be permanently removed.</p>
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
