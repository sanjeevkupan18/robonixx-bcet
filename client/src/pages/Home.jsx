import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ChevronDown, Cpu, Zap, Globe, Trophy, ArrowRight, Users, Bot, Radio, SatelliteDish, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import SectionHeader from '../components/ui/SectionHeader';
import { EventCardSkeleton, FeatureCardSkeleton, ProfileCardSkeleton, StatCardSkeleton, TextBlockSkeleton } from '../components/ui/Skeletons';
import { eventsAPI, contentAPI, galleryAPI } from '../utils/api';
import { getDisplayMediaUrl, isVideoMedia } from '../utils/media';

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = () => {
        start += Math.ceil(target / 60);
        if (start >= target) { setCount(target); return; }
        setCount(start);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { icon: Trophy, label: 'Events Hosted', value: 30, suffix: '+' },
  { icon: Users, label: 'Active Members', value: 80, suffix: '+' },
  { icon: Zap, label: 'Projects Built', value: 25, suffix: '+' },
  { icon: Globe, label: 'Years Active', value: 1, suffix: '' },
];

const OFFERINGS = [
  { icon: Cpu, title: 'IoT Systems', desc: 'Hands-on workshops with real IoT hardware, sensors, and smart devices.' },
  { icon: Zap, title: 'Robotics', desc: 'Build and program autonomous robots from scratch using industry tools.' },
  { icon: Globe, title: 'Innovation Lab', desc: 'Open lab access to prototype your ideas with 3D printers and electronics.' },
];

const WHY_JOIN_POINTS = [
  'Technical hands-on experience',
  'IoT bootcamps and workshops',
  'Event management exposure',
  'Build strong networks',
  'Learn about robotics',
  'Leadership development',
  'Teamwork and collaboration',
  'Communication skills',
  'Project-based learning',
  'Peer mentorship and guidance',
];

const ABOUT_FALLBACK_SLIDES = [
  {
    title: 'Hands-on Innovation',
    description: 'Workshops, hardware labs, and prototype sessions that turn curiosity into real builds.',
    gradient: 'from-primary/30 via-primary/10 to-transparent',
  },
  {
    title: 'Student-Led Culture',
    description: 'A collaborative club space where members learn, teach, and grow together through projects.',
    gradient: 'from-accent/30 via-accent/10 to-transparent',
  },
  {
    title: 'Projects With Purpose',
    description: 'From smart systems to autonomous robots, every idea is shaped into something practical.',
    gradient: 'from-emerald-400/30 via-emerald-400/10 to-transparent',
  },
];

const FLOATING_OBJECTS = [
  {
    icon: Cpu,
    label: 'Sensor Grid',
    detail: 'IoT Core',
    position: 'left-[2%] top-[23%] md:left-[9%] md:top-[29%]',
    size: 'h-24 w-24 md:h-32 md:w-32',
    face: 'from-primary/25 via-space-800/90 to-space-900/95',
    iconColor: 'text-primary',
    tilt: -14,
    mobile: true,
    delay: 0.1,
  },
  {
    icon: Bot,
    label: 'Bot Shell',
    detail: 'Autonomous',
    position: 'right-[4%] top-[18%] md:right-[11%] md:top-[26%]',
    size: 'h-24 w-24 md:h-36 md:w-36',
    face: 'from-accent/25 via-space-800/90 to-space-900/95',
    iconColor: 'text-accent',
    tilt: 12,
    mobile: false,
    delay: 0.6,
  },
  {
    icon: Radio,
    label: 'Signal Link',
    detail: 'Wireless',
    position: 'left-[10%] bottom-[21%] md:left-[18%] md:bottom-[18%]',
    size: 'h-20 w-20 md:h-28 md:w-28',
    face: 'from-emerald-400/25 via-space-800/90 to-space-900/95',
    iconColor: 'text-emerald-300',
    tilt: -10,
    mobile: false,
    delay: 1.1,
  },
  {
    icon: SatelliteDish,
    label: 'Uplink Hub',
    detail: 'Robotics',
    position: 'right-[6%] bottom-[18%] md:right-[16%] md:bottom-[20%]',
    size: 'h-24 w-24 md:h-32 md:w-32',
    face: 'from-sky-400/25 via-space-800/90 to-space-900/95',
    iconColor: 'text-sky-300',
    tilt: 15,
    mobile: true,
    delay: 1.5,
  },
];

export default function Home() {
  const [siteContent, setSiteContent] = useState(null);
  const [latestEvent, setLatestEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [aboutImages, setAboutImages] = useState([]);
  const [activeAboutSlide, setActiveAboutSlide] = useState(0);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingLatestEvent, setLoadingLatestEvent] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    contentAPI.get('site_settings').then(({ data }) => setSiteContent(data.content)).catch(() => {}).finally(() => setLoadingContent(false));
    eventsAPI.getAll({ limit: 1 }).then(({ data }) => setLatestEvent(data.events?.[0] || null)).catch(() => {}).finally(() => setLoadingLatestEvent(false));
    eventsAPI.getAll({ status: 'upcoming', limit: 3 }).then(({ data }) => setUpcomingEvents(data.events)).catch(() => {}).finally(() => setLoadingEvents(false));
    galleryAPI.getAll({ limit: 5 }).then(({ data }) => setAboutImages(data.images || [])).catch(() => {}).finally(() => setLoadingGallery(false));
  }, []);

  const aboutSlides = aboutImages.length > 0 ? aboutImages : ABOUT_FALLBACK_SLIDES;

  useEffect(() => {
    if (aboutSlides.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveAboutSlide((current) => (current + 1) % aboutSlides.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [aboutSlides]);

  useEffect(() => {
    setActiveAboutSlide((current) => (current >= aboutSlides.length ? 0 : current));
  }, [aboutSlides.length]);

  const tagline = siteContent?.tagline || 'Where Innovation Meets Intelligence';
  const motto = siteContent?.motto || 'Build. Learn. Innovate.';
  const hodName = siteContent?.hodName || 'Dr. Priya Sharma';
  const hodDesignation = siteContent?.hodDesignation || 'Head of Department';
  const aboutText = siteContent?.about || 'Robonixx is a premier IoT & Robotics club that empowers students to explore, create, and lead in the world of intelligent machines and connected systems.';
  const aboutSnippet = aboutText.length > 210 ? `${aboutText.slice(0, 210).trimEnd()}...` : aboutText;
  const latestEventDescription = latestEvent
    ? (latestEvent.fullDescription || latestEvent.shortDescription || '').length > 280
      ? `${(latestEvent.fullDescription || latestEvent.shortDescription || '').slice(0, 280).trimEnd()}...`
      : (latestEvent.fullDescription || latestEvent.shortDescription || '')
    : '';

  return (
    <>
      <Helmet>
        <title>Robonixx - From Idea to Automation</title>
      </Helmet>
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-100" />
        <div className="absolute inset-0 hex-pattern opacity-100" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/[0.08] rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Circuit SVG decoration */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M10 10 H50 V50 H90 V10 H130 V50 H170 V10" fill="none" stroke="#5DADE2" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="3" fill="#5DADE2" />
              <circle cx="50" cy="50" r="2" fill="#A29BFE" />
              <circle cx="90" cy="10" r="3" fill="#5DADE2" />
              <path d="M10 110 V150 H50 V190" fill="none" stroke="#A29BFE" strokeWidth="0.5" />
              <circle cx="10" cy="110" r="2" fill="#A29BFE" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        {/* Floating 3D objects */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {FLOATING_OBJECTS.map(({ icon: Icon, label, detail, position, size, face, iconColor, tilt, mobile, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 28, rotateX: 16, rotateZ: tilt }}
              animate={{
                opacity: 1,
                y: [0, -18, 0, 12, 0],
                x: [0, 6, 0, -5, 0],
                rotateZ: [tilt, tilt + 3, tilt - 2, tilt],
                rotateX: [16, 10, 18, 16],
              }}
              transition={{
                duration: 7.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
              }}
              className={`absolute ${position} ${mobile ? 'block' : 'hidden md:block'}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`relative ${size}`} style={{ transformStyle: 'preserve-3d' }}>
                <div
                  className="absolute left-3 right-3 -top-3 h-6 rounded-2xl border border-white/10 bg-white/10"
                  style={{ transform: 'rotateX(74deg)', transformOrigin: 'bottom' }}
                />
                <div
                  className="absolute -right-3 top-3 bottom-3 w-6 rounded-r-2xl border border-white/10 bg-white/10"
                  style={{ transform: 'rotateY(-72deg)', transformOrigin: 'left' }}
                />
                <div className={`relative h-full w-full rounded-[1.75rem] border border-white/15 bg-gradient-to-br ${face} backdrop-blur-xl shadow-[0_22px_50px_rgba(2,6,23,0.55)]`}>
                  <div className="absolute inset-3 rounded-[1.25rem] border border-white/10" />
                  <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-white/30" />
                  <div className="absolute right-4 bottom-4 h-3 w-3 rounded-full bg-primary/40 blur-[1px]" />
                  <div className="flex h-full flex-col justify-between p-4 md:p-5">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 md:h-12 md:w-12 ${iconColor}`}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500 md:text-[11px]">
                        {detail}
                      </p>
                      <p className="mt-1 font-display text-xs font-bold text-white md:text-sm">{label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 section-container text-center pt-24"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8 border border-primary/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-primary tracking-widest">ROBONIXX CLUB — ACTIVE</span>
          </motion.div>

          {/* Club name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-6xl md:text-7xl lg:text-8xl mb-4 leading-none"
          >
            <span className="gradient-text">ROBO</span>
            <span className="text-white">NIXX</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-300 font-body mb-3"
          >
            {tagline}
          </motion.p>

          {/* Motto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 font-mono text-sm text-primary mb-10"
          >
            <span className="h-px w-8 bg-primary/60" />
            {motto}
            <span className="h-px w-8 bg-primary/60" />
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link to="/events" className="btn-primary shadow-glow-blue">
              <Zap className="w-4 h-4" />
              Explore Events
            </Link>
            <Link to="/about" className="btn-outline">
              Join Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* HOD section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="inline-flex items-center gap-4 glass rounded-2xl px-6 py-4 border border-white/5"
          >
            {loadingContent ? (
              <>
                <div className="w-12 h-12 rounded-full shimmer" />
                <div className="text-left space-y-2">
                  <div className="h-3 w-24 shimmer rounded" />
                  <div className="h-3 w-32 shimmer rounded" />
                  <div className="h-3 w-24 shimmer rounded" />
                </div>
              </>
            ) : siteContent?.hodImage ? (
              <img src={siteContent.hodImage} alt={hodName} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center ring-2 ring-primary/30">
                <span className="font-display font-bold text-primary text-lg">
                  {hodName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
            {!loadingContent && (
              <div className="text-left">
                <p className="text-xs text-slate-500 font-mono mb-0.5">Head of Club</p>
                <p className="text-sm font-semibold text-white">{hodName}</p>
                <p className="text-xs text-primary">{hodDesignation}</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingContent
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : STATS.map(({ icon: Icon, label, value, suffix }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="glass rounded-2xl p-6 text-center glow-border-blue"
                  >
                    <Icon className="w-6 h-6 text-primary mx-auto mb-3 opacity-80" />
                    <div className="font-display font-black text-3xl gradient-text mb-1">
                      <Counter target={value} suffix={suffix} />
                    </div>
                    <p className="text-xs text-slate-400">{label}</p>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT PREVIEW ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-12 md:py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative glass rounded-3xl overflow-hidden min-h-[300px] md:min-h-[360px] border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              {loadingGallery ? (
                <div className="absolute inset-0 p-6 md:p-8">
                  <div className="h-full w-full rounded-[1.75rem] shimmer" />
                </div>
              ) : aboutSlides.map((slide, index) => {
                const isActive = index === activeAboutSlide;
                  const isMediaSlide = 'url' in slide;

                  return (
                    <motion.div
                      key={isMediaSlide ? slide._id || slide.url : slide.title}
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.04 }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      {isMediaSlide ? (
                        <>
                          {isVideoMedia(slide) ? (
                            <video
                              src={slide.url}
                              className="h-full w-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={getDisplayMediaUrl(slide)}
                              alt={slide.caption || `Robonixx gallery slide ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/35 to-space-950/10" />
                          <div className="absolute left-5 right-5 bottom-5">
                            <p className="inline-flex items-center rounded-full border border-white/10 bg-space-900/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">
                              {isVideoMedia(slide) ? 'Club Reel' : 'Club Moments'}
                            </p>
                          <p className="mt-3 max-w-md text-sm text-slate-200">
                            {slide.caption || 'Snapshots from workshops, events, and student-led innovation at Robonixx.'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative h-full w-full overflow-hidden bg-space-900">
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
                        <div className="absolute inset-0 grid-bg opacity-30" />
                        <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
                        <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
                          <p className="inline-flex w-fit items-center rounded-full border border-white/10 bg-space-900/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">
                            About Robonixx
                          </p>
                          <h3 className="mt-4 font-display text-2xl font-black text-white">{slide.title}</h3>
                          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">{slide.description}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {!loadingGallery && aboutSlides.length > 1 && (
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-space-950/70 px-3 py-2 backdrop-blur-md">
                  {aboutSlides.map((slide, index) => (
                    <button
                      key={'url' in slide ? slide._id || slide.url : slide.title}
                      type="button"
                      onClick={() => setActiveAboutSlide(index)}
                      aria-label={`Show slide ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeAboutSlide ? 'w-7 bg-primary' : 'w-2.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-8 md:p-10 border border-white/10 flex flex-col justify-center"
            >
              {loadingContent ? (
                <>
                  <div className="h-6 w-24 shimmer rounded-full mb-4" />
                  <div className="h-10 w-3/4 shimmer rounded mb-4" />
                  <TextBlockSkeleton lines={4} />
                  <div className="grid grid-cols-2 gap-3 my-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-2xl h-12 shimmer" />
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-32 shimmer rounded-lg" />
                    <div className="h-3 w-24 shimmer rounded" />
                  </div>
                </>
              ) : (
                <>
                  <span className="tag mb-4 w-fit">About Us</span>
                  <h2 className="font-display font-black text-3xl md:text-4xl mb-4">
                    A Club Built to <span className="gradient-text">Create, Learn, and Lead</span>
                  </h2>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-6">
                    {aboutSnippet}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      `Founded ${siteContent?.foundationYear || 2019}`,
                      'IoT and robotics focus',
                      'Student-led community',
                      'Workshops and projects',
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs md:text-sm text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link to="/about" className="btn-primary shadow-glow-blue">
                      Know More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">
                      Discover our story
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LATEST EVENT SPOTLIGHT ─────────────────────────────────────── */}
      {(loadingLatestEvent || latestEvent) && (
        <section className="relative z-10 py-8 md:py-12">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-space-900/70"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-accent/[0.08]" />
              <div className="absolute inset-0 grid-bg opacity-30" />

              {loadingLatestEvent ? (
                <div className="relative grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-0">
                  <div className="min-h-[260px] shimmer" />
                  <div className="p-8 md:p-10">
                    <div className="h-6 w-28 shimmer rounded-full mb-4" />
                    <div className="h-10 w-3/4 shimmer rounded mb-4" />
                    <TextBlockSkeleton lines={4} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                      <div className="h-12 shimmer rounded-2xl" />
                      <div className="h-12 shimmer rounded-2xl" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-0">
                  <div className="relative min-h-[280px] lg:min-h-full overflow-hidden bg-space-800">
                    {latestEvent.image ? (
                      <img
                        src={latestEvent.image}
                        alt={latestEvent.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[280px] items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-space-900 to-space-950" />
                        <span className="relative font-display text-5xl font-black text-white/10">RBX</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/35 to-transparent" />
                    <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                      <span className={`badge-${latestEvent.status}`}>
                        {latestEvent.status.charAt(0).toUpperCase() + latestEvent.status.slice(1)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-primary">
                        Latest Event
                      </span>
                    </div>
                  </div>

                  <div className="relative p-8 md:p-10 lg:p-12">
                    <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-primary">
                      Event Spotlight
                    </p>
                    <h2 className="mt-4 font-display text-3xl font-black text-white md:text-4xl">
                      {latestEvent.title}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
                      {latestEventDescription}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">When</p>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{format(new Date(latestEvent.date), 'EEE, MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">Where</p>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="truncate">{latestEvent.venue || 'Venue to be announced'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Link to={`/events/${latestEvent.slug || latestEvent._id}`} className="btn-primary shadow-glow-blue">
                        View Event Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <span className="text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
                        {latestEvent.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── WHAT WE OFFER ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20">
        <div className="section-container">
          <SectionHeader tag="What We Do" title="Built for Innovators" subtitle="From IoT sensors to autonomous robots — Robonixx is where ideas become machines." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingContent
              ? Array.from({ length: 3 }).map((_, i) => <FeatureCardSkeleton key={i} />)
              : OFFERINGS.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                    className="group glass rounded-2xl p-6 card-hover border border-white/5 hover:border-primary/20"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-base text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ─── UPCOMING EVENTS ──────────────────────────────────────────────── */}
      {(loadingEvents || upcomingEvents.length > 0) && (
        <section className="relative z-10 py-20">
          <div className="section-container">
            <SectionHeader tag="What's Next" title="Upcoming Events" subtitle="Don't miss out — register early and secure your spot." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {loadingEvents
                ? Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
                : upcomingEvents.map((event, i) => (
                    <EventCard key={event._id} event={event} index={i} />
                  ))}
            </div>
            {!loadingEvents && (
              <div className="text-center">
                <Link to="/events" className="btn-outline">
                  View All Events <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── WHY JOIN ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20">
        <div className="section-container">
          <SectionHeader
            tag="Why Join Robonixx"
            title="Grow Beyond the Classroom"
            subtitle="Build technical depth, gain real-world exposure, and become part of a club culture that helps you create, lead, and connect."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WHY_JOIN_POINTS.map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="glass rounded-2xl p-5 border border-white/10 card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-primary shadow-glow-sm flex-shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── JOIN CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-10 md:p-16 text-center overflow-hidden glow-border-blue"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-accent/[0.08]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative">
              <h2 className="font-display font-black text-3xl md:text-4xl mb-4">
                Ready to <span className="gradient-text">Build the Future?</span>
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
                Join Robonixx and be part of a community that's shaping the future through robotics, IoT, and intelligent systems. Open to all branches.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/contact" className="btn-primary shadow-glow-blue">
                  Get In Touch <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/members" className="btn-outline">
                  Meet the Team
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
