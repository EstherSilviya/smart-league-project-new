// src/pages/admin/AdminCriteriaEditor.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCriteriaList, saveCriteria } from '../../firebase/firestore';
import { AdminSidebar, AdminTopBar } from '../../components/Layout';

const CATEGORIES = ['Athletics', 'Academic', 'Arts', 'Science', 'Social Impact', 'Technology', 'Leadership', 'Other'];
const LEVELS = ['School', 'District', 'State', 'National', 'International'];

const emptyForm = {
  name: '', description: '', category: 'Academic', level: 'School',
  points: 10, requirements: [''], isActive: true,
};

export const AdminCriteriaEditor = () => {
  const navigate = useNavigate();
  const [criteriaList, setCriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCriteriaList().then(data => { setCriteriaList(data); setLoading(false); });
  }, []);

  const selectCriteria = (c) => {
    setSelected(c.id);
    setForm({ ...emptyForm, ...c, requirements: c.requirements?.length ? c.requirements : [''] });
    setSaved(false);
  };

  const newCriteria = () => {
    setSelected(null);
    setForm(emptyForm);
    setSaved(false);
  };

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const updateReq = (idx, val) => {
    setForm(prev => {
      const reqs = [...prev.requirements];
      reqs[idx] = val;
      return { ...prev, requirements: reqs };
    });
  };

  const addReq = () => setForm(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  const removeReq = (idx) => setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const id = await saveCriteria(selected, { ...form, requirements: form.requirements.filter(r => r.trim()) });
    if (!selected) {
      setCriteriaList(prev => [{ id, ...form }, ...prev]);
      setSelected(id);
    } else {
      setCriteriaList(prev => prev.map(c => c.id === selected ? { ...c, ...form } : c));
    }
    setSaved(true);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tighter text-primary">Achievement Criteria Editor</h1>
            <p className="text-on-surface-variant text-sm mt-1">Define the rules and requirements for achievements.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Criteria List */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-on-surface">Criteria Templates</h2>
                <button onClick={newCriteria}
                  className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded-full text-xs font-bold hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-sm">add</span> New
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse" />)
                ) : criteriaList.length === 0 ? (
                  <div className="bg-surface-container-low rounded-2xl p-6 text-center">
                    <p className="text-on-surface-variant text-sm">No criteria yet. Create one!</p>
                  </div>
                ) : criteriaList.map(c => (
                  <button key={c.id} onClick={() => selectCriteria(c)}
                    className={`p-4 rounded-2xl text-left transition-all ${selected === c.id ? 'bg-primary text-on-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${selected === c.id ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{c.category}</span>
                      <div className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-secondary-fixed' : 'bg-outline'}`} />
                    </div>
                    <p className={`font-semibold text-sm line-clamp-1 ${selected === c.id ? 'text-on-primary' : 'text-on-surface'}`}>{c.name}</p>
                    <p className={`text-xs mt-0.5 ${selected === c.id ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>{c.points} pts · {c.level}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-2 bg-surface-container-low rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-on-surface">{selected ? 'Edit Criteria' : 'New Criteria'}</h2>
                {saved && (
                  <span className="flex items-center gap-1 text-xs font-bold text-on-tertiary-container">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Saved
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Criteria Name</label>
                  <input type="text" value={form.name} onChange={update('name')}
                    className="bg-surface-container rounded-xl h-12 px-4 text-sm outline-none focus:ring-2 ring-primary/30"
                    placeholder="e.g. National Championship Winner" />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Description</label>
                  <textarea value={form.description} onChange={update('description')}
                    className="bg-surface-container rounded-xl p-4 text-sm outline-none focus:ring-2 ring-primary/30 resize-none h-20"
                    placeholder="Describe when this criteria applies..." />
                </div>

                {/* Category + Level + Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
                    <select value={form.category} onChange={update('category')}
                      className="bg-surface-container rounded-xl h-12 px-4 text-sm outline-none border-none">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Level</label>
                    <select value={form.level} onChange={update('level')}
                      className="bg-surface-container rounded-xl h-12 px-4 text-sm outline-none border-none">
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Points</label>
                    <input type="number" value={form.points} onChange={update('points')} min={1} max={1000}
                      className="bg-surface-container rounded-xl h-12 px-4 text-sm outline-none focus:ring-2 ring-primary/30" />
                  </div>
                </div>

                {/* Requirements */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Requirements</label>
                    <button onClick={addReq} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-sm">add</span> Add
                    </button>
                  </div>
                  {form.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                      </div>
                      <input type="text" value={req} onChange={e => updateReq(idx, e.target.value)}
                        className="flex-1 bg-surface-container rounded-xl h-10 px-4 text-sm outline-none focus:ring-2 ring-primary/30"
                        placeholder={`Requirement ${idx + 1}...`} />
                      {form.requirements.length > 1 && (
                        <button onClick={() => removeReq(idx)} className="text-error hover:bg-error-container p-1.5 rounded-lg transition-all">
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-6 rounded-full transition-all ${form.isActive ? 'bg-primary' : 'bg-outline-variant'}`}
                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-all mt-0.5 ${form.isActive ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-on-surface">Active — show in assignment form</span>
                </label>

                <button onClick={handleSave} disabled={saving || !form.name.trim()}
                  className="h-12 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>Saving...</> : 'Save Criteria'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
