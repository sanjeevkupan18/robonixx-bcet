import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit, Trash2, X, Upload, Users, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { membersAPI } from '../../utils/api';
import { IMAGE_ACCEPT } from '../../utils/media';

const BATCHES = ['2025', '2026', '2027', '2028', '2029', '2030', 'alumni'];
const CORE_ROLES = ['', 'president', 'vice-president', 'tech-lead', 'secretary', 'treasurer', 'media-head', 'event-head', 'member'];
const EMPTY = { name: '', role: '', batch: '2026', department: '', shortBio: '', isCoreTeam: false, coreRole: '', order: 99, active: true, socialLinks: { linkedin: '', github: '', instagram: '', portfolio: '' } };
const MAX_IMAGE_SIZE_MB = 15;

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const fileRef = useRef();

  const fetchMembers = async () => {
    try { const { data } = await membersAPI.getAll(); setMembers(data.members); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const openAdd = () => { setForm(EMPTY); setImage(null); setImagePreview(''); setModal({ open: true, mode: 'add' }); };
  const openEdit = (m) => {
    setForm({ ...EMPTY, ...m, socialLinks: { linkedin: '', github: '', instagram: '', portfolio: '', ...m.socialLinks } });
    setImagePreview(m.image || '');
    setImage(null);
    setModal({ open: true, mode: 'edit', data: m });
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Please upload an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    setImage(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      const { socialLinks, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => {
        if (k !== 'image' && k !== 'imagePublicId' && k !== '__v' && k !== '_id' && k !== 'createdAt' && k !== 'updatedAt' && v !== undefined)
          fd.append(k, v);
      });
      fd.append('socialLinks', JSON.stringify(socialLinks));
      if (image) fd.append('image', image);

      if (modal.mode === 'add') { await membersAPI.create(fd); toast.success('Member added!'); }
      else { await membersAPI.update(modal.data._id, fd); toast.success('Member updated!'); }
      setModal({ open: false, mode: 'add', data: null });
      fetchMembers();
    } catch (err) {
      if (err.code === 'ECONNABORTED') toast.error('Upload timed out. Please try a smaller image or retry.');
      else toast.error(err.response?.data?.message || 'Operation failed');
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await membersAPI.delete(id); toast.success('Member removed'); setDeleteConfirm(null); fetchMembers(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = members.filter(m => {
    const bm = batchFilter === 'all' || m.batch === batchFilter;
    const sm = search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    return bm && sm;
  });

  const setSocialLink = (key, val) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } }));

  return (
    <>
      <Helmet><title>Manage Members — Robonixx Admin</title></Helmet>
      <AdminLayout title="Manage Members">

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 text-sm" />
          </div>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="input-field sm:w-40 text-sm">
            <option value="all">All Batches</option>
            {BATCHES.map(b => <option key={b} value={b}>Batch '{b}</option>)}
          </select>
          <button onClick={openAdd} className="btn-primary flex-shrink-0"><Plus className="w-4 h-4" /> Add Member</button>
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(m => (
              <motion.div key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-xl p-4 border border-white/5 relative group">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-space-700 flex-shrink-0 ring-2 ring-white/10">
                    {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center"><User className="w-5 h-5 text-slate-500" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                    <p className="text-xs text-accent truncate">{m.role}</p>
                    <p className="text-xs text-slate-500 font-mono">Batch '{m.batch}</p>
                    {m.isCoreTeam && <span className="text-xs text-primary">⭐ Core</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => openEdit(m)} className="flex-1 py-1.5 rounded-lg text-xs text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(m._id)} className="flex-1 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {modal.open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center bg-space-950/80 backdrop-blur-sm overflow-y-auto py-8 px-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-space-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h2 className="font-display font-bold text-base text-white">{modal.mode === 'add' ? 'Add Member' : 'Edit Member'}</h2>
                  <button onClick={() => setModal({ open: false })} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Photo */}
                  <div className="flex items-center gap-4">
                    <div onClick={() => fileRef.current.click()} className="w-20 h-20 rounded-full overflow-hidden bg-space-700 flex items-center justify-center border-2 border-dashed border-white/10 hover:border-primary/30 cursor-pointer transition-all flex-shrink-0">
                      {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" /> :
                        <Upload className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Profile Photo</p>
                      <button type="button" onClick={() => fileRef.current.click()} className="text-xs text-primary hover:underline mt-1">Upload image</button>
                    </div>
                    <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handleImageChange} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1 font-mono">Full Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field text-sm" required placeholder="Full name" /></div>
                    <div><label className="block text-xs text-slate-400 mb-1 font-mono">Role *</label><input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field text-sm" required placeholder="e.g., Tech Lead" /></div>
                    <div><label className="block text-xs text-slate-400 mb-1 font-mono">Batch *</label>
                      <select value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} className="input-field text-sm">
                        {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-xs text-slate-400 mb-1 font-mono">Department</label><input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="input-field text-sm" placeholder="ECE, CSE..." /></div>
                    <div><label className="block text-xs text-slate-400 mb-1 font-mono">Display Order</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="input-field text-sm" /></div>
                    <div className="col-span-2"><label className="block text-xs text-slate-400 mb-1 font-mono">Short Bio</label><textarea value={form.shortBio} onChange={e => setForm(f => ({ ...f, shortBio: e.target.value }))} className="input-field text-sm resize-none" rows={2} placeholder="Brief bio..." maxLength={200} /></div>

                    {/* Core team toggle */}
                    <div className="col-span-2 flex items-center gap-3">
                      <input type="checkbox" id="isCoreTeam" checked={form.isCoreTeam} onChange={e => setForm(f => ({ ...f, isCoreTeam: e.target.checked }))} className="w-4 h-4 accent-primary" />
                      <label htmlFor="isCoreTeam" className="text-xs text-slate-400 font-mono">Core Team Member</label>
                      {form.isCoreTeam && (
                        <select value={form.coreRole} onChange={e => setForm(f => ({ ...f, coreRole: e.target.value }))} className="input-field text-xs flex-1">
                          {CORE_ROLES.map(r => <option key={r} value={r}>{r || 'Select role...'}</option>)}
                        </select>
                      )}
                    </div>

                    {/* Social links */}
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 font-mono mb-2">Social Links</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['linkedin', 'github', 'instagram', 'portfolio'].map(key => (
                          <input key={key} value={form.socialLinks[key]} onChange={e => setSocialLink(key, e.target.value)} className="input-field text-xs" placeholder={`${key} URL`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModal({ open: false })} className="btn-ghost flex-1 justify-center text-sm">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center shadow-glow-blue disabled:opacity-60">
                      {submitting ? 'Saving...' : modal.mode === 'add' ? 'Add Member' : 'Update'}
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
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-space-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center">
                <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-white mb-2">Remove Member?</h3>
                <p className="text-slate-400 text-sm mb-5">This will permanently delete the member and their data.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors">Remove</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </AdminLayout>
    </>
  );
}
