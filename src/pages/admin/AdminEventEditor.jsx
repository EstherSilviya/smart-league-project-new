import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent } from '../../firebase/firestore';

export const AdminEventEditor = ({ onBack }) => {
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    month: '',
    criteria: 'UG',
    departments: []
  });

  const availableDepartments = [
    'Computer Science', 'Business Administration', 'Engineering',
    'Arts & Humanities', 'Sciences', 'Law', 'Medicine'
  ];

  const handleCheckboxChange = (dept) => {
    setForm(prev => {
      if (prev.departments.includes(dept)) {
        return { ...prev, departments: prev.departments.filter(d => d !== dept) };
      }
      return { ...prev, departments: [...prev.departments, dept] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent({
        ...form,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || 'Admin',
        institution: userProfile?.institution || 'Unknown',
        status: 'published' // Auto-publish for now
      });
      setShowSuccess(true);
      setForm({
        title: '',
        description: '',
        date: '',
        month: '',
        criteria: 'UG',
        departments: []
      });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. See console.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
      <div className="bg-surface-container-lowest border-b border-outline-variant/20 p-6 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <h2 className="text-xl font-black text-on-surface">Post New Event</h2>
          <p className="text-xs text-on-surface-variant font-medium">Publish an inter-college event to the public feed.</p>
        </div>
      </div>

      <div className="p-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-3 border border-green-200 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <span className="text-sm font-bold">Event successfully published to the public feed!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          {/* Title & Description */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">Event Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
                placeholder="E.g., Annual Tech Symposium"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
                rows={4}
                placeholder="What is this event about?"
                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exact Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span> Exact Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all shadow-sm"
              />
            </div>

            {/* Event Month */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">date_range</span> Event Month
              </label>
              <input
                type="month"
                value={form.month}
                onChange={e => setForm({...form, month: e.target.value})}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Criteria Toggles */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-outline">Participation Criteria</label>
            <div className="flex gap-4">
              {['UG', 'PG', 'Both'].map(crit => (
                <button
                  type="button"
                  key={crit}
                  onClick={() => setForm({...form, criteria: crit})}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${form.criteria === crit ? 'bg-primary border-primary text-on-primary shadow-md' : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'}`}
                >
                  {crit === 'UG' ? 'Undergrad (UG)' : crit === 'PG' ? 'Postgrad (PG)' : 'Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Departments Multi-Select */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-outline">Departments</label>
            <div className="grid grid-cols-2 gap-3">
              {availableDepartments.map(dept => (
                <label key={dept} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={form.departments.includes(dept)}
                    onChange={() => handleCheckboxChange(dept)}
                  />
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${form.departments.includes(dept) ? 'bg-primary border-primary' : 'bg-surface-container-lowest border-outline-variant/50 group-hover:border-primary/50'}`}>
                    {form.departments.includes(dept) && <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>}
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-outline-variant/20">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto bg-primary text-on-primary px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">publish</span>}
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
