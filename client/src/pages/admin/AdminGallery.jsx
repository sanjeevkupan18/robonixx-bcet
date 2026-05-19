import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Upload, Trash2, Image, X, Plus, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { galleryAPI } from '../../utils/api';
import { GALLERY_ACCEPT, getDisplayMediaUrl, isHeicFile, isMp4File, isVideoMedia } from '../../utils/media';

const CATEGORIES = ['events', 'workshops', 'activities', 'team', 'campus', 'other'];

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedCat, setSelectedCat] = useState('other');
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const fileRef = useRef();

  const fetchImages = async () => {
    try {
      const params = {};
      if (filterCat !== 'all') params.category = filterCat;
      const { data } = await galleryAPI.getAll({ ...params, limit: 50 });
      setImages(data.images);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchImages(); }, [filterCat]);
  useEffect(() => () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setFiles(selected);
    setPreviews(selected.map((file) => ({
      url: URL.createObjectURL(file),
      isVideo: isMp4File(file),
      isHeic: isHeicFile(file),
      name: file.name,
    })));
  };

  const handleUpload = async () => {
    if (!files.length) { toast.error('Select at least one file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      fd.append('category', selectedCat);
      fd.append('caption', caption);
      await galleryAPI.upload(fd);
      toast.success(`${files.length} file(s) uploaded!`);
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setFiles([]); setPreviews([]); setCaption(''); fileRef.current.value = '';
      fetchImages();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    try { await galleryAPI.delete(id); toast.success('Media deleted'); setDeleteConfirm(null); fetchImages(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <Helmet><title>Manage Gallery — Robonixx Admin</title></Helmet>
      <AdminLayout title="Gallery Manager">

        {/* Upload section */}
        <div className="glass rounded-2xl p-5 border border-white/5 mb-6">
          <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" /> Upload Media
          </h3>

          <div onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-white/10 hover:border-primary/30 rounded-xl p-6 text-center cursor-pointer transition-all mb-4">
            {previews.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-space-800">
                    {p.isVideo ? (
                      <video src={p.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    ) : p.isHeic ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center">
                        <Image className="h-6 w-6 text-primary" />
                        <p className="text-[11px] font-mono uppercase tracking-wide text-slate-300">HEIC</p>
                      </div>
                    ) : (
                      <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Click to select images or MP4 videos</p>
                <p className="text-xs text-slate-600 mt-1">Supports JPG, PNG, WEBP, HEIC, HEIF, and MP4 files</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept={GALLERY_ACCEPT} multiple className="hidden" onChange={handleFileChange} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="input-field text-sm capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={caption} onChange={e => setCaption(e.target.value)} className="input-field text-sm sm:col-span-2" placeholder="Caption (optional)" />
          </div>

          <button onClick={handleUpload} disabled={uploading || !files.length} className="btn-primary shadow-glow-blue disabled:opacity-50">
            {uploading ? 'Uploading...' : <><Plus className="w-4 h-4" /> Upload {files.length > 0 ? `${files.length} File(s)` : 'Files'}</>}
          </button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {['all', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filterCat === cat ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-xl shimmer" />)}
          </div>
        ) : images.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Image className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No media uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map(img => (
              <motion.div key={img._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-space-800">
                {isVideoMedia(img) ? (
                  <video src={img.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" muted playsInline preload="metadata" />
                ) : (
                  <img src={getDisplayMediaUrl(img)} alt={img.caption || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-space-900/0 group-hover:bg-space-900/70 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                  <button onClick={() => setDeleteConfirm(img._id)}
                    className="opacity-0 group-hover:opacity-100 transition-all w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="absolute top-1.5 left-1.5">
                  <span className="text-xs bg-space-900/70 text-slate-400 px-1.5 py-0.5 rounded font-mono">{img.category}</span>
                </div>
                {isVideoMedia(img) && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className="inline-flex items-center gap-1 rounded bg-space-900/70 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-slate-300">
                      <Video className="h-3 w-3" /> MP4
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/80 backdrop-blur-sm px-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-space-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center">
                <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-display font-bold text-base text-white mb-2">Delete Media?</h3>
                <p className="text-slate-400 text-sm mb-5">This will permanently remove the file from Cloudinary and the gallery.</p>
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
