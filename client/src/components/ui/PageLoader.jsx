import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-space-900 flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden border border-primary/20 bg-white/5 shadow-glow-sm"
          animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 bg-primary/10 animate-pulse-slow" />
          <img
            src="/robonixx_logo.jpeg"
            alt="Robonixx logo"
            className="relative w-full h-full object-cover"
          />
        </motion.div>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="mt-3 text-slate-500 font-mono text-xs tracking-widest">LOADING...</p>
      </div>
    </div>
  );
}
