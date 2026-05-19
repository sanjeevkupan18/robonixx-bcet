import { motion } from 'framer-motion';

export default function SectionHeader({ tag, title, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${center ? 'text-center' : ''}`}
    >
      {tag && (
        <div className={`flex items-center gap-2 mb-3 ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-primary/50" />
          <span className="tag">{tag}</span>
          <span className="h-px w-8 bg-primary/50" />
        </div>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
