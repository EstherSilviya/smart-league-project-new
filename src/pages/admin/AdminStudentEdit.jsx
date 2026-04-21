import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentBySlug, updateStudent } from '../../firebase/firestore';

export const AdminStudentEdit = ({ slug: propSlug, onBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const slug = propSlug || params.slug;
  
  const [studentId, setStudentId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    courseYear: '',
    rollNo: '',
    email: '',
    bio: '',
    focusAreas: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getStudentBySlug(slug);
        if (data) {
          setStudentId(data.id);
          setForm({
            name: data.name || '',
            courseYear: data.courseYear || '',
            rollNo: data.rollNo || '',
            email: data.email || '',
            bio: data.bio || '',
            focusAreas: (data.focusAreas || []).join(', '),
          });
        }
      } catch (err) {
        console.error("Error fetching student:", err);
      }
      setLoading(false);
    };
    fetchStudent();
  }, [slug]);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setSaving(true);
    try {
      const focusAreas = form.focusAreas.split(',').map(f => f.trim()).filter(Boolean);
      await updateStudent(studentId, { ...form, focusAreas, profileCompleted: true });
      alert('Student profile completed successfully!');
      if (onBack) onBack();
      else navigate('/admin');
    } catch (err) {
      alert('Error saving profile: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-2">Complete Student Profile</h2>
        <p className="text-sm text-on-surface-variant mb-8">Fill in the remaining details for {form.name || slug}.</p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-outline">Full Name</label>
            <input type="text" value={form.name} onChange={update('name')} className="w-full bg-surface-container rounded-lg p-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">Course Year</label>
              <input type="text" value={form.courseYear} onChange={update('courseYear')} className="w-full bg-surface-container rounded-lg p-3" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">Roll No</label>
              <input type="text" value={form.rollNo} onChange={update('rollNo')} className="w-full bg-surface-container rounded-lg p-3" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-outline">Student Email</label>
            <input type="email" value={form.email} onChange={update('email')} className="w-full bg-surface-container rounded-lg p-3" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-outline">Focus Areas (comma separated)</label>
            <input type="text" value={form.focusAreas} onChange={update('focusAreas')} placeholder="e.g. Data Ethics, Game Theory" className="w-full bg-surface-container rounded-lg p-3" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-outline">Bio</label>
            <textarea value={form.bio} onChange={update('bio')} className="w-full bg-surface-container rounded-lg p-3 h-32" />
          </div>

          <div className="pt-6 border-t border-outline-variant/20 flex justify-end gap-4">
            <button type="button" onClick={onBack || (() => navigate('/admin'))} className="px-6 py-2 rounded-full font-bold text-on-surface-variant hover:text-primary transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-8 py-2 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 transition-opacity">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
