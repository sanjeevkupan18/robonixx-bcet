import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save, Upload, RefreshCw, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { contentAPI } from '../../utils/api';
import { IMAGE_ACCEPT } from '../../utils/media';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5 font-mono">{label}</label>
      {children}
    </div>
  );
}

const DEFAULT_FACULTY_MEMBERS = [
  {
    name: 'Dr. Priya Sharma',
    designation: 'Head of Department, Electronics & Communication',
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

const normalizeFacultyMembers = (facultyMembers) => (
  Array.isArray(facultyMembers) ? facultyMembers : DEFAULT_FACULTY_MEMBERS
);

const normalizeCurrentLeaders = (currentLeaders) => (
  Array.isArray(currentLeaders) ? currentLeaders : DEFAULT_CURRENT_LEADERS
);

const MAX_IMAGE_SIZE_MB = 15;

export default function AdminContent() {
  const [content, setContent] = useState({
    tagline: '', motto: '', about: '', foundationYear: 2019,
    hodName: '', hodDesignation: '', hodImage: '',
    facultyMembers: DEFAULT_FACULTY_MEMBERS,
    currentLeaders: DEFAULT_CURRENT_LEADERS,
    socialLinks: { instagram: '', linkedin: '', github: '' },
    contactAddress: '', contactEmail: '', contactPhone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hodFile, setHodFile] = useState(null);
  const [hodPreview, setHodPreview] = useState('');
  const [facultyUploads, setFacultyUploads] = useState({});
  const [leaderUploads, setLeaderUploads] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    contentAPI.get('site_settings').then(({ data }) => {
      setContent(prev => ({
        ...prev,
        ...data.content,
        socialLinks: { ...prev.socialLinks, ...data.content?.socialLinks },
        facultyMembers: normalizeFacultyMembers(data.content?.facultyMembers),
        currentLeaders: normalizeCurrentLeaders(data.content?.currentLeaders),
      }));
      setHodPreview(data.content?.hodImage || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await contentAPI.uploadImage(fd);
    return data.url;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let hodImageUrl = content.hodImage;

      // Upload HOD image first if selected
      if (hodFile) {
        hodImageUrl = await uploadImage(hodFile);
      }

      const facultyMembers = await Promise.all(
        (content.facultyMembers || []).map(async (member, index) => ({
          ...member,
          image: facultyUploads[index]?.file ? await uploadImage(facultyUploads[index].file) : (member.image || ''),
        }))
      );

      const currentLeaders = await Promise.all(
        (content.currentLeaders || []).map(async (leader, index) => ({
          ...leader,
          image: leaderUploads[index]?.file ? await uploadImage(leaderUploads[index].file) : (leader.image || ''),
        }))
      );

      await contentAPI.update('site_settings', {
        ...content,
        hodImage: hodImageUrl,
        facultyMembers,
        currentLeaders,
      });
      toast.success('Site content updated!');
      setContent(c => ({ ...c, hodImage: hodImageUrl, facultyMembers, currentLeaders }));
      setHodPreview(hodImageUrl);
      setHodFile(null);
      setFacultyUploads({});
      setLeaderUploads({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const set = (key, val) => setContent(c => ({ ...c, [key]: val }));
  const setSocial = (key, val) => setContent(c => ({ ...c, socialLinks: { ...c.socialLinks, [key]: val } }));
  const setFacultyMember = (index, key, val) => setContent(c => ({
    ...c,
    facultyMembers: c.facultyMembers.map((member, i) => (i === index ? { ...member, [key]: val } : member)),
  }));
  const setLeader = (index, key, val) => setContent(c => ({
    ...c,
    currentLeaders: c.currentLeaders.map((leader, i) => (i === index ? { ...leader, [key]: val } : leader)),
  }));

  const validateImageFile = (file) => {
    if (!file) return false;
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Please upload an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleHodFile = (e) => {
    const f = e.target.files[0];
    if (!validateImageFile(f)) return;
    setHodFile(f);
    setHodPreview(URL.createObjectURL(f));
  };
  const handleFacultyFile = (index, e) => {
    const f = e.target.files[0];
    if (!validateImageFile(f)) return;
    setFacultyUploads(prev => ({ ...prev, [index]: { file: f, preview: URL.createObjectURL(f) } }));
  };
  const handleLeaderFile = (index, e) => {
    const f = e.target.files[0];
    if (!validateImageFile(f)) return;
    setLeaderUploads(prev => ({ ...prev, [index]: { file: f, preview: URL.createObjectURL(f) } }));
  };
  const addFacultyMember = () => {
    setContent(c => ({
      ...c,
      facultyMembers: [...c.facultyMembers, { name: '', designation: '', description: '', image: '' }],
    }));
  };
  const removeFacultyMember = (index) => {
    setContent(c => ({
      ...c,
      facultyMembers: c.facultyMembers.filter((_, i) => i !== index),
    }));
    setFacultyUploads({});
  };
  const addLeader = () => {
    setContent(c => ({
      ...c,
      currentLeaders: [...c.currentLeaders, { name: '', branch: '', position: '', image: '' }],
    }));
  };
  const removeLeader = (index) => {
    setContent(c => ({
      ...c,
      currentLeaders: c.currentLeaders.filter((_, i) => i !== index),
    }));
    setLeaderUploads({});
  };

  if (loading) return <AdminLayout title="Site Content"><div className="text-center py-20 text-slate-400 text-sm">Loading...</div></AdminLayout>;

  return (
    <>
      <Helmet><title>Site Content — Robonixx Admin</title></Helmet>
      <AdminLayout title="Site Content">

        <div className="space-y-6">

          {/* Hero text */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-primary mb-5">🏠 Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tagline *">
                <input value={content.tagline} onChange={e => set('tagline', e.target.value)} className="input-field text-sm" placeholder="Where Innovation Meets Intelligence" />
              </Field>
              <Field label="Motto *">
                <input value={content.motto} onChange={e => set('motto', e.target.value)} className="input-field text-sm" placeholder="Build. Learn. Innovate." />
              </Field>
              <Field label="Foundation Year">
                <input type="number" value={content.foundationYear} onChange={e => set('foundationYear', e.target.value)} className="input-field text-sm" />
              </Field>
            </div>
          </div>

          {/* About section */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-primary mb-5">📖 About Section</h3>
            <Field label="About Club Description">
              <textarea value={content.about} onChange={e => set('about', e.target.value)} rows={4} className="input-field text-sm resize-none" placeholder="Describe the club..." />
            </Field>
          </div>

          {/* HOD section */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-primary mb-5">👨‍🏫 Head of Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div onClick={() => fileRef.current.click()}
                  className="w-24 h-24 rounded-full overflow-hidden bg-space-700 border-2 border-dashed border-white/10 hover:border-primary/30 cursor-pointer transition-all flex items-center justify-center">
                  {hodPreview ? <img src={hodPreview} alt="HOD" className="w-full h-full object-cover" /> :
                    <Upload className="w-6 h-6 text-slate-500" />}
                </div>
                <button type="button" onClick={() => fileRef.current.click()} className="text-xs text-primary hover:underline">Upload Photo</button>
                <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handleHodFile} />
              </div>

              <div className="md:col-span-2 space-y-3">
                <Field label="HOD Name">
                  <input value={content.hodName} onChange={e => set('hodName', e.target.value)} className="input-field text-sm" placeholder="Dr. Full Name" />
                </Field>
                <Field label="HOD Designation">
                  <input value={content.hodDesignation} onChange={e => set('hodDesignation', e.target.value)} className="input-field text-sm" placeholder="Head of Department, Electronics & Communication" />
                </Field>
              </div>
            </div>
          </div>

          {/* Faculty support cards */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display font-bold text-sm text-primary">🧑‍🏫 Faculty Support Cards</h3>
                <p className="text-xs text-slate-500 mt-1">These cards are shown in the About page faculty support section.</p>
              </div>
              <button type="button" onClick={addFacultyMember} className="btn-outline">
                <Plus className="w-4 h-4" /> Add Faculty
              </button>
            </div>
            <div className="space-y-4">
              {content.facultyMembers.map((member, index) => (
                <div key={`faculty-${index}`} className="rounded-2xl border border-white/10 bg-space-900/40 p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-xs font-mono text-slate-400">Faculty Card {index + 1}</p>
                    <button type="button" onClick={() => removeFacultyMember(index)} className="btn-ghost">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="flex flex-col items-center gap-3">
                      <label className="w-24 h-24 rounded-full overflow-hidden bg-space-700 border-2 border-dashed border-white/10 hover:border-primary/30 cursor-pointer transition-all flex items-center justify-center">
                        {facultyUploads[index]?.preview || member.image ? (
                          <img src={facultyUploads[index]?.preview || member.image} alt={member.name || `Faculty ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-slate-500" />
                        )}
                        <input type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => handleFacultyFile(index, e)} />
                      </label>
                      <span className="text-xs text-primary">Upload Photo</span>
                      <span className="text-[11px] text-slate-500">Cloudinary, up to {MAX_IMAGE_SIZE_MB}MB</span>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Name">
                        <input value={member.name || ''} onChange={e => setFacultyMember(index, 'name', e.target.value)} className="input-field text-sm" placeholder="Faculty name" />
                      </Field>
                      <Field label="Designation">
                        <input value={member.designation || ''} onChange={e => setFacultyMember(index, 'designation', e.target.value)} className="input-field text-sm" placeholder="Faculty designation" />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Description">
                          <textarea value={member.description || ''} onChange={e => setFacultyMember(index, 'description', e.target.value)} rows={3} className="input-field text-sm resize-none" placeholder="Short faculty description..." />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current club leaders */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display font-bold text-sm text-primary">🧭 Current Club Leaders</h3>
                <p className="text-xs text-slate-500 mt-1">These cards are shown in the About page current leaders section.</p>
              </div>
              <button type="button" onClick={addLeader} className="btn-outline">
                <Plus className="w-4 h-4" /> Add Leader
              </button>
            </div>
            <div className="space-y-4">
              {content.currentLeaders.map((leader, index) => (
                <div key={`leader-${index}`} className="rounded-2xl border border-white/10 bg-space-900/40 p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-xs font-mono text-slate-400">Leader Card {index + 1}</p>
                    <button type="button" onClick={() => removeLeader(index)} className="btn-ghost">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="flex flex-col items-center gap-3">
                      <label className="w-24 h-24 rounded-full overflow-hidden bg-space-700 border-2 border-dashed border-white/10 hover:border-primary/30 cursor-pointer transition-all flex items-center justify-center">
                        {leaderUploads[index]?.preview || leader.image ? (
                          <img src={leaderUploads[index]?.preview || leader.image} alt={leader.name || `Leader ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-slate-500" />
                        )}
                        <input type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => handleLeaderFile(index, e)} />
                      </label>
                      <span className="text-xs text-primary">Upload Photo</span>
                      <span className="text-[11px] text-slate-500">Cloudinary, up to {MAX_IMAGE_SIZE_MB}MB</span>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label="Name">
                        <input value={leader.name || ''} onChange={e => setLeader(index, 'name', e.target.value)} className="input-field text-sm" placeholder="Leader name" />
                      </Field>
                      <Field label="Branch">
                        <input value={leader.branch || ''} onChange={e => setLeader(index, 'branch', e.target.value)} className="input-field text-sm" placeholder="ECE, CSE..." />
                      </Field>
                      <Field label="Position">
                        <input value={leader.position || ''} onChange={e => setLeader(index, 'position', e.target.value)} className="input-field text-sm" placeholder="President, Secretary..." />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-primary mb-5">📬 Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email">
                <input value={content.contactEmail} onChange={e => set('contactEmail', e.target.value)} className="input-field text-sm" placeholder="club@college.edu" />
              </Field>
              <Field label="Phone">
                <input value={content.contactPhone} onChange={e => set('contactPhone', e.target.value)} className="input-field text-sm" placeholder="+91 98765 43210" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address">
                  <input value={content.contactAddress} onChange={e => set('contactAddress', e.target.value)} className="input-field text-sm" placeholder="Room number, block, campus..." />
                </Field>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-bold text-sm text-primary mb-5">🔗 Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['instagram', 'linkedin', 'github'].map(platform => (
                <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                  <input value={content.socialLinks?.[platform] || ''} onChange={e => setSocial(platform, e.target.value)}
                    className="input-field text-sm" placeholder={`https://${platform}.com/robonixx`} />
                </Field>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-end gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary shadow-glow-blue disabled:opacity-60">
              {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>

      </AdminLayout>
    </>
  );
}
