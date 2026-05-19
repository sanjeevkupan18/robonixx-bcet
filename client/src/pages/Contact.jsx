import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, Github, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { contactAPI } from '../utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const campusAddress = 'Bengal College of Engineering & Technology , Bidhan Nagar, Durgapur, West Bengal 713212';
  const campusMapUrl = 'https://www.google.com/maps?q=Bengal+College+of+Engineering+and+Technology,+Shahid+Sukumar+Banerjee+Sarani,+Bidhan+Nagar,+Durgapur,+West+Bengal+713212&output=embed';
  const campusDirectionsUrl = 'https://www.google.com/maps/search/?api=1&query=Bengal+College+of+Engineering+and+Technology,+Shahid+Sukumar+Banerjee+Sarani,+Bidhan+Nagar,+Durgapur,+West+Bengal+713212';

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      await contactAPI.send(form);
      setSent(true);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact — Robonixx</title>
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg" />
        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="tag mb-4 inline-block">Get In Touch</span>
            <h1 className="font-display font-black text-4xl md:text-6xl mb-4">
              <span className="gradient-text">Contact</span> Us
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Have a question, collaboration idea, or want to join Robonixx?
              We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display font-bold text-xl text-white mb-6">
                  Let's Connect
                </h2>

                {/* Info cards */}
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: "robonix.bcet@gmail.com",
                    href: "mailto:robonix.bcet@gmail.com",
                    color: "text-primary",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+91 9264144666",
                    href: "tel:+919264144666",
                    color: "text-accent",
                  },
                  {
                    icon: MapPin,
                    label: "Address",
                    value: campusAddress,
                    href: campusDirectionsUrl,
                    color: "text-emerald-400",
                  },
                ].map(({ icon: Icon, label, value, href, color }) => (
                  <div
                    key={label}
                    className="glass rounded-xl p-4 flex items-start gap-4 mb-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className={`text-sm text-white hover:${color} transition-colors`}
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Social links */}
                <div>
                  <p className="text-xs text-slate-500 font-mono mb-3">
                    FOLLOW US
                  </p>
                  <div className="flex items-center gap-3">
                    {[
                      {
                        icon: Instagram,
                        href: "https://www.instagram.com/robonixx.bcet_/",
                        label: "Instagram",
                        color: "hover:text-pink-400",
                      },
                      {
                        icon: Linkedin,
                        href: "https://www.linkedin.com/company/robonixx-bcet/posts/?feedView=all",
                        label: "LinkedIn",
                        color: "hover:text-blue-400",
                      },
                      {
                        icon: Github,
                        href: "https://github.com/robonixbcet-cpu",
                        label: "GitHub",
                        color: "hover:text-white",
                      },
                    ].map(({ icon: Icon, href, label, color }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className={`w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 ${color} transition-all hover:scale-110`}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              {sent ? (
                <div className="glass rounded-2xl p-10 text-center glow-border-blue h-full flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    We'll get back to you within 24-48 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="btn-outline text-sm"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="glass rounded-2xl p-8 space-y-5"
                >
                  <h2 className="font-display font-bold text-lg text-white mb-2">
                    Send a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-mono">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      rows={6}
                      className="input-field resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-blue"
                  >
                    {sending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-space-900/40 border-t-space-900 rounded-full"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Map embed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl overflow-hidden glass border border-white/5 h-64"
          >
            <iframe
              src={campusMapUrl}
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "invert(90%) hue-rotate(180deg) saturate(0.8)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bengal College of Engineering and Technology location"
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
