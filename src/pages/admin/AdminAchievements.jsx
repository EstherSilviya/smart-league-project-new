// src/pages/admin/AdminAssignAchievement.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, assignAchievement, getAchievements } from '../../firebase/firestore';
import { uploadAchievementImage } from '../../firebase/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar, AdminTopBar } from '../../components/Layout';

const CATEGORIES = ['Athletics', 'Academic', 'Arts', 'Science', 'Social Impact', 'Technology', 'Leadership', 'Other'];

export const AdminAssignAchievement = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Academic', date: '', level: 'School', notes: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (studentId) {
      getUserProfile(studentId).then(p => { setStudent(p); setLoading(false); });
    }
  }, [studentId]);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let imageURL = '';
      const ref = await assignAchievement(studentId, {
        ...form,
        studentName: student.displayName,
        institution: student.institution,
        imageURL: '',
      }, currentUser.uid);

      if (imageFile) {
        imageURL = await uploadAchievementImage(ref.id, imageFile, setUploadProgress);
        // Update with image URL
        const { updateAchievement } = await import('../../firebase/firestore');
        await updateAchievement(ref.id, { imageURL });
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin/students'), 2000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-pulse text-outline">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="max-w-3xl mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant text-sm mb-4 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
            <h1 className="text-3xl font-extrabold tracking-tighter text-primary">Assign Achievement</h1>
            {student && (
              <div className="flex items-center gap-3 mt-3 p-4 bg-surface-container-low rounded-2xl">
                {student.photoURL ? (
                  <img src={student.photoURL} alt={student.displayName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-lg font-bold text-primary">
                    {(student.displayName || 'S')[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-on-surface">{student.displayName}</p>
                  <p className="text-sm text-on-surface-variant">{student.institution}</p>
                </div>
              </div>
            )}
          </div>

          {success && (
            <div className="mb-6 p-4 bg-secondary-container rounded-2xl text-on-secondary-fixed-variant font-medium flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Achievement assigned successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Achievement Image (Optional)</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-2xl h-48 cursor-pointer hover:bg-surface-container-low transition-all overflow-hidden ${imagePreview ? 'p-0' : 'p-6'}`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">add_photo_alternate</span>
                    <p className="text-sm text-on-surface-variant font-medium">Click to upload image</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>

            {/* Form Fields */}
            {[
              { field: 'title', label: 'Achievement Title', placeholder: 'e.g. National Science Fair Winner', required: true },
              { field: 'description', label: 'Description', placeholder: 'Describe the achievement...', multiline: true },
              { field: 'notes', label: 'Internal Notes (Admin only)', placeholder: 'Optional internal context...', multiline: true },
            ].map(({ field, label, placeholder, required, multiline }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
                {multiline ? (
                  <textarea value={form[field]} onChange={update(field)}
                    className="bg-surface-container-low rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary/30 resize-none h-24"
                    placeholder={placeholder} />
                ) : (
                  <input type="text" value={form[field]} onChange={update(field)} required={required}
                    className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none focus:ring-2 ring-primary/30"
                    placeholder={placeholder} />
                )}
              </div>
            ))}

            {/* Category + Level + Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
                <select value={form.category} onChange={update('category')}
                  className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none border-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Level</label>
                <select value={form.level} onChange={update('level')}
                  className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none border-none">
                  {['School', 'District', 'State', 'National', 'International'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</label>
                <input type="date" value={form.date} onChange={update('date')}
                  className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none border-none focus:ring-2 ring-primary/30" />
              </div>
            </div>

            <button type="submit" disabled={saving || !form.title.trim()}
              className="h-14 bg-primary text-on-primary rounded-2xl font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> Assigning...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span> Assign Achievement</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

// ─── ADMIN STUDENT DETAIL ─────────────────────────────────────────────────────
export const AdminStudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, a] = await Promise.all([
        getUserProfile(studentId),
        getAchievements({ studentId }),
      ]);
      setStudent(p);
      setAchievements(a);
      setLoading(false);
    };
    load();
  }, [studentId]);

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-pulse text-outline">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-6 lg:p-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant text-sm mb-6 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Students
          </button>

          {/* Student hero */}
          <div className="bg-surface-container-low rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {student?.photoURL ? (
                <img src={student.photoURL} alt={student.displayName} className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary-container flex items-center justify-center text-4xl font-bold text-primary">
                  {(student?.displayName || 'S')[0]}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-primary tracking-tight">{student?.displayName}</h1>
                <p className="text-on-surface-variant mt-1">{student?.institution}</p>
                <p className="text-sm text-outline mt-0.5">{student?.email}</p>
                {student?.bio && <p className="text-sm text-on-surface mt-3 max-w-lg">{student.bio}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate(`/admin/achievements/assign/${studentId}`)}
                  className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  Award Achievement
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-outline-variant/20">
              {[
                { label: 'Total Achievements', value: achievements.length },
                { label: 'Categories', value: [...new Set(achievements.map(a => a.category))].length },
                { label: 'Role', value: student?.role || 'Student' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-headline text-2xl font-extrabold text-primary">{value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-outline mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <h2 className="text-xl font-extrabold text-primary mb-4">Achievements</h2>
          {achievements.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-outline mb-3">workspace_premium</span>
              <p className="text-on-surface-variant">No achievements assigned yet.</p>
              <button onClick={() => navigate(`/admin/achievements/assign/${studentId}`)}
                className="mt-4 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                Assign First Achievement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(a => (
                <div key={a.id} className="bg-surface-container-low rounded-2xl p-5 flex gap-4">
                  {a.imageURL ? (
                    <img src={a.imageURL} alt={a.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-on-secondary-container bg-secondary-container/30 px-2 py-0.5 rounded uppercase">{a.category}</span>
                    <h4 className="font-bold text-on-surface mt-1">{a.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
