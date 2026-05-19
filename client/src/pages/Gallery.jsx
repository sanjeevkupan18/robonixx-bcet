import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { X, ZoomIn, ChevronLeft, ChevronRight, Image, PlayCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import { GalleryGridSkeleton } from '../components/ui/Skeletons';
import { galleryAPI } from '../utils/api';
import { getDisplayMediaUrl, isVideoMedia } from '../utils/media';

const CATEGORIES = ['all', 'events', 'workshops', 'activities', 'team', 'campus', 'other'];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 18 };
        if (category !== 'all') params.category = category;
        const { data } = await galleryAPI.getAll(params);
        setImages(data.images);
        setTotalPages(data.pages);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [category, page]);

  const openLightbox = (index) => {
    setLightbox({ open: true, index });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightbox({ open: false, index: 0 });
    document.body.style.overflow = '';
  }, []);

  const prev = useCallback(() => setLightbox(l => ({ ...l, index: (l.index - 1 + images.length) % images.length })), [images.length]);
  const next = useCallback(() => setLightbox(l => ({ ...l, index: (l.index + 1) % images.length })), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (!lightbox.open) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open, prev, next, closeLightbox]);

  const currentImg = images[lightbox.index];

  return (
    <>
      <Helmet><title>Gallery — Robonixx</title></Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg" />
        <div className="section-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="tag mb-4 inline-block">Visual Archive</span>
            <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
              <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Captured moments from our workshops, events, hackathons, and campus activities.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-8">
        <div className="section-container">

          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  category === cat ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {cat === 'all' ? '🖼️ All' : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <GalleryGridSkeleton count={12} />
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No media in this category yet.</p>
            </div>
          ) : (
            <>
              {/* Masonry-style grid */}
              <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
                {images.map((img, i) => (
                  <motion.div key={img._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
                    className="relative break-inside-avoid group cursor-pointer rounded-xl overflow-hidden"
                    onClick={() => openLightbox(i)}
                  >
                    {isVideoMedia(img) ? (
                      <video src={img.url} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" muted playsInline preload="metadata" />
                    ) : (
                      <img src={getDisplayMediaUrl(img)} alt={img.caption || 'Gallery'} loading="lazy"
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-space-900/0 group-hover:bg-space-900/50 transition-all duration-300 flex items-center justify-center">
                      {isVideoMedia(img) ? (
                        <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                      ) : (
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                      )}
                    </div>
                    {img.caption && (
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-space-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-xs text-white truncate">{img.caption}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-primary text-space-900 font-bold' : 'glass text-slate-400 hover:text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && currentImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-space-950/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}>

            {/* Controls */}
            <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 p-2 rounded-full glass text-white hover:text-primary transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 p-3 rounded-full glass text-white hover:text-primary transition-colors z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 p-3 rounded-full glass text-white hover:text-primary transition-colors z-10">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image */}
            <motion.div
              key={lightbox.index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="max-w-4xl max-h-[80vh] mx-4"
            >
              {isVideoMedia(currentImg) ? (
                <video
                  src={currentImg.url}
                  className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={getDisplayMediaUrl(currentImg)} alt={currentImg.caption || 'Gallery'}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" />
              )}
              {currentImg.caption && (
                <p className="text-center text-sm text-slate-400 mt-3">{currentImg.caption}</p>
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-slate-500">
              {lightbox.index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
