import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Star, Target, Lightbulb, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MemberCard from '../components/MemberCard';
import SectionHeader from '../components/ui/SectionHeader';
import { FeatureCardSkeleton, MemberCardSkeleton, ProfileCardSkeleton, TextBlockSkeleton } from '../components/ui/Skeletons';
import { contentAPI, membersAPI } from '../utils/api';

const VALUES = [
  { icon: Star, title: 'Excellence', desc: 'We push boundaries and aim for the highest standards in everything we build.' },
  { icon: Target, title: 'Innovation', desc: 'Creative problem-solving and novel approaches to real-world challenges.' },
  { icon: Lightbulb, title: 'Learning', desc: 'Continuous growth through hands-on projects, workshops, and collaboration.' },
  { icon: Users, title: 'Community', desc: 'A diverse, inclusive team united by passion for technology.' },
];

const SHARED_PROFILE_IMAGE = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 viewBox%3D%220 0 160 160%22%3E%3Cdefs%3E%3ClinearGradient id%3D%22g%22 x1%3D%220%22 y1%3D%220%22 x2%3D%221%22 y2%3D%221%22%3E%3Cstop offset%3D%220%25%22 stop-color%3D%22%230ea5e9%22/%3E%3Cstop offset%3D%22100%25%22 stop-color%3D%22%238b5cf6%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width%3D%22160%22 height%3D%22160%22 rx%3D%2232%22 fill%3D%22%230f172a%22/%3E%3Ccircle cx%3D%2280%22 cy%3D%2260%22 r%3D%2228%22 fill%3D%22url(%23g)%22/%3E%3Cpath d%3D%22M34 132c8-24 28-38 46-38s38 14 46 38%22 fill%3D%22url(%23g)%22/%3E%3Ccircle cx%3D%22122%22 cy%3D%2240%22 r%3D%228%22 fill%3D%22%2322c55e%22 opacity%3D%220.9%22/%3E%3C/svg%3E';

const DEFAULT_FACULTY_MEMBERS = [
  {
    name: 'Dr. Priya Sharma',
    designation: 'Head of Department',
    description: 'Guiding Robonixx with wisdom and vision, enabling students to achieve excellence in technology and innovation.',
    image: '',
  },
  {
    name: 'Faculty Coordinator',
    designation: 'Robonixx Faculty Coordinator',
    description: 'Supports club operations, event planning, and student coordination throughout the academic year.',
    image: '',
  },
  {
    name: 'Technical Mentor',
    designation: 'Project and Workshop Mentor',
    description: 'Guides members during build sessions, bootcamps, and interdisciplinary project development.',
    image: '',
  },
];

const DEFAULT_CURRENT_LEADERS = [
  { name: 'Leader 01', branch: 'ECE', position: 'President', image: '' },
  { name: 'Leader 02', branch: 'CSE', position: 'Vice President', image: '' },
  { name: 'Leader 03', branch: 'EEE', position: 'Technical Lead', image: '' },
  { name: 'Leader 04', branch: 'ECE', position: 'Secretary', image: '' },
  { name: 'Leader 05', branch: 'ME', position: 'Event Head', image: '' },
  { name: 'Leader 06', branch: 'CSE', position: 'Media Head', image: '' },
  { name: 'Leader 07', branch: 'ECE', position: 'Operations Lead', image: '' },
];

const FOUNDER = {
  name: 'Founder Name',
  position: 'Founder, Robonixx Club',
  image: SHARED_PROFILE_IMAGE,
};

const CLUB_ROLE_AREAS = [
  {
    title: 'Technical Team',
    description: 'The technical team drives robotics builds, IoT experiments, coding sessions, hardware integration, and project execution across the club.',
  },
  {
    title: 'Event Management Team',
    description: 'This team plans workshops, competitions, bootcamps, and club activities while making sure every event runs smoothly from start to finish.',
  },
  {
    title: 'Public Relation Team',
    description: 'The public relation team handles outreach, visibility, communication, collaborations, and helps build Robonixx as a strong student community.',
  },
];

export default function About() {
  const [content, setContent] = useState(null);
  const [coreTeam, setCoreTeam] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    contentAPI.get('site_settings').then(({ data }) => setContent(data.content)).catch(() => {}).finally(() => setLoadingContent(false));
    membersAPI.getAll({ isCore: true }).then(({ data }) => setCoreTeam(data.members)).catch(() => {}).finally(() => setLoadingTeam(false));
  }, []);

  const facultyMembers = Array.isArray(content?.facultyMembers)
    ? content.facultyMembers
    : DEFAULT_FACULTY_MEMBERS.map((faculty, index) => ({
        ...faculty,
        image: index === 0 ? (content?.hodImage || faculty.image) : faculty.image,
        name: index === 0 ? (content?.hodName || faculty.name) : faculty.name,
        designation: index === 0 ? (content?.hodDesignation || faculty.designation) : faculty.designation,
      }));

  const currentLeaders = Array.isArray(content?.currentLeaders) ? content.currentLeaders : DEFAULT_CURRENT_LEADERS;

  return (
    <>
      <Helmet><title>About Us — Robonixx</title></Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg" />
        <div className="section-container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="tag mb-4 inline-block">Our Story</span>
            <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
              <span className="gradient-text">About</span> Robonixx
            </h1>
            {loadingContent ? (
              <div className="max-w-2xl mx-auto"><TextBlockSkeleton lines={3} /></div>
            ) : (
              <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                {content?.about || 'Robonixx is a premier IoT & Robotics club that empowers students to explore, create, and lead in the world of intelligent machines and connected systems.'}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Foundation + Mission */}
      <section className="relative z-10 py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {loadingContent ? (
              <>
                <div className="glass rounded-2xl p-8 border border-white/10">
                  <div className="h-6 w-24 shimmer rounded-full mb-4" />
                  <div className="h-8 w-40 shimmer rounded mb-4" />
                  <TextBlockSkeleton lines={4} />
                  <div className="space-y-3 mt-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shimmer" />
                        <div className="h-3 w-3/4 shimmer rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-8 border border-white/10">
                  <div className="h-8 w-8 shimmer rounded mb-4" />
                  <TextBlockSkeleton lines={4} />
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-32 shimmer rounded" />
                      <div className="h-3 w-20 shimmer rounded" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <span className="tag mb-4 inline-block">Since {content?.foundationYear || 2019}</span>
                  <h2 className="font-display font-bold text-2xl md:text-3xl mb-4 gradient-text">Our Mission</h2>
                  <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                    Founded in {content?.foundationYear || 2019}, Robonixx was born from a simple belief — that students learn best by building. We create an environment where curiosity meets hardware, and ideas become tangible solutions.
                  </p>
                  <div className="space-y-3">
                    {['Hands-on IoT & Robotics workshops', 'Industry expert sessions & bootcamps', 'Competitive hackathons & project expos', 'Open innovation lab access'].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="circuit-dot flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <div className="glass rounded-2xl p-8 border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                    <blockquote className="relative">
                      <div className="text-5xl text-primary/30 font-display font-black mb-4">"</div>
                      <p className="text-lg text-slate-300 leading-relaxed font-body italic mb-6">
                        {content?.motto || 'Build. Learn. Innovate.'} — That's not just our motto. It's our way of life.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-display font-bold text-sm">RB</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Robonixx Founders</p>
                          <p className="text-xs text-primary">{content?.foundationYear || 2019}</p>
                        </div>
                      </div>
                    </blockquote>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Faculty Support */}
      {(loadingContent || facultyMembers.length > 0) && (
        <section className="relative z-10 py-16">
          <div className="section-container">
            <SectionHeader
              tag="Faculty Support"
              title="Meet Our Faculty Mentors"
              subtitle="The academic mentors who guide Robonixx through club activities, workshops, and innovation-focused projects."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadingContent
                ? Array.from({ length: 3 }).map((_, i) => <ProfileCardSkeleton key={i} />)
                : facultyMembers.map((faculty, i) => (
                    <motion.div
                      key={`${faculty.name || 'faculty'}-${faculty.designation || i}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: i * 0.1 }}
                      className="glass rounded-2xl p-8 text-center border border-white/10 card-hover transition-all duration-300 hover:border-primary/30 hover:shadow-glow-sm"
                    >
                      <img
                        src={faculty.image || SHARED_PROFILE_IMAGE}
                        alt={faculty.name || `Faculty ${i + 1}`}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-2 ring-primary/30"
                      />
                      <h3 className="font-display font-bold text-base text-white mb-1">{faculty.name || 'Faculty Member'}</h3>
                      <p className="text-sm text-primary mb-3">{faculty.designation || 'Faculty Mentor'}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{faculty.description || 'Robonixx faculty support member.'}</p>
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* Current Club Leaders */}
      {(loadingContent || currentLeaders.length > 0) && (
        <section className="relative z-10 py-16">
          <div className="section-container">
            <SectionHeader
              tag="Current Club Leaders"
              title="The Mentors Leading Robonixx"
              subtitle="A snapshot of the current leadership team driving club events, projects, and student initiatives."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loadingContent
                ? Array.from({ length: 4 }).map((_, i) => <ProfileCardSkeleton key={i} />)
                : currentLeaders.map((leader, i) => (
                    <motion.div
                      key={`${leader.name || 'leader'}-${leader.position || i}`}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: i * 0.06 }}
                      className="glass rounded-2xl p-6 border border-white/10 card-hover text-center"
                    >
                      <div className="relative mb-4">
                        <img
                          src={leader.image || SHARED_PROFILE_IMAGE}
                          alt={leader.name || `Leader ${i + 1}`}
                          className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-primary/30"
                        />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5">
                          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary">Lead</span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-sm text-white mb-1">{leader.name || 'Leader Name'}</h3>
                      <p className="text-xs text-accent/80 font-medium mb-2">{leader.position || 'Club Position'}</p>
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400">
                        {leader.branch || 'Branch'}
                      </div>
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* Founder + Club Story */}
      <section className="relative z-10 py-16">
        <div className="section-container">
          <SectionHeader
            tag="Founder and Story"
            title="How Robonixx Began"
            subtitle="A quick look at the vision behind the club, how it grew, and the key roles that shape its activities today."
          />
          <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-12">
            {loadingContent ? (
              <>
                <div className="glass rounded-3xl p-8 border border-white/10 text-center lg:col-span-5">
                  <div className="w-28 h-28 rounded-full shimmer mx-auto mb-5" />
                  <div className="h-6 w-24 shimmer rounded-full mx-auto mb-4" />
                  <div className="h-5 w-40 shimmer rounded mx-auto mb-2" />
                  <div className="h-4 w-32 shimmer rounded mx-auto mb-4" />
                  <TextBlockSkeleton lines={3} />
                </div>
                <div className="space-y-6 lg:col-span-7">
                  <div className="glass rounded-3xl p-8 border border-white/10">
                    <div className="h-8 w-48 shimmer rounded mb-4" />
                    <TextBlockSkeleton lines={5} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => <FeatureCardSkeleton key={i} />)}
                  </div>
                </div>
              </>
            ) : (
              <>
              {/* Founder div Container */}
                {/* <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="glass rounded-3xl p-8 border border-white/10 text-center"
                >
                  <img
                    src={FOUNDER.image}
                    alt={FOUNDER.name}
                    className="w-28 h-28 rounded-full object-cover mx-auto mb-5 ring-2 ring-primary/30"
                  />
                  <span className="tag mb-4 inline-block">Club Founder</span>
                  <h3 className="font-display font-bold text-xl text-white mb-2">{FOUNDER.name}</h3>
                  <p className="text-sm text-primary mb-4">{FOUNDER.position}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    The founder laid the first stones of Robonixx with a vision to create a student space where ideas could move beyond theory and become real, hands-on innovation.
                  </p>
                </motion.div> */}

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 lg:col-span-7 [&:only-child]:lg:col-span-12"
                >
                  <div className="glass rounded-3xl p-8 border border-white/10">
                    <h3 className="font-display font-bold text-2xl text-white mb-4">
                      The <span className="gradient-text">Robonixx Story</span>
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      Robonixx started with a simple mission: to give students a place to explore robotics, IoT, and emerging technologies through building, experimenting, and teamwork. Over time, the club evolved into a platform where members not only learn technical skills, but also gain confidence, leadership, and collaboration experience.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Today, Robonixx continues to grow through projects, events, workshops, and student-led initiatives that help members turn curiosity into capability and ideas into impact.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CLUB_ROLE_AREAS.map((role, i) => (
                      <motion.div
                        key={role.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="glass rounded-2xl p-5 border border-white/10 card-hover"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <span className="text-primary font-display font-bold text-sm">{role.title.charAt(0)}</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-white mb-2">{role.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{role.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 py-16">
        <div className="section-container">
          <SectionHeader tag="Core Values" title="What Drives Us" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass rounded-xl p-6 text-center card-hover border border-white/5 hover:border-accent/20">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display font-bold text-sm text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Team */}
      {(loadingTeam || coreTeam.length > 0) && (
        <section className="relative z-10 py-16">
          <div className="section-container">
            <SectionHeader tag="The Team" title="Core Members" subtitle="The dedicated individuals who keep Robonixx running." />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {loadingTeam
                ? Array.from({ length: 5 }).map((_, i) => <MemberCardSkeleton key={i} />)
                : coreTeam.map((member, i) => (
                    <MemberCard key={member._id} member={member} index={i} />
                  ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
