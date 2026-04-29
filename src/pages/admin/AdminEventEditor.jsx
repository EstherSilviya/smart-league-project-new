import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent } from '../../firebase/firestore';

export const AdminEventEditor = ({ onBack }) => {
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    month: '',
    criteria: 'Both',
    departments: [],
    tags: []
  });

  const availableDepartments = [
    'Computer Science', 'Business Administration', 'Engineering',
    'Arts & Humanities', 'Sciences', 'Law', 'Medicine'
  ];

  const defaultTags = [
    'Workshop', 'Symposium', 'Sports', 'Cultural', 'Webinar', 'Hackathon', 'Seminar', 'Conference'
  ];

  const handleCheckboxChange = (dept) => {
    setForm(prev => {
      if (prev.departments.includes(dept)) {
        return { ...prev, departments: prev.departments.filter(d => d !== dept) };
      }
      return { ...prev, departments: [...prev.departments, dept] };
    });
  };

  const toggleTag = (tag) => {
    setForm(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      }
      return { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const addCustomTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !form.tags.includes(tag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
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
        status: 'published',
        createdAt: new Date()
      });
      setShowSuccess(true);
      setForm({
        title: '',
        description: '',
        date: '',
        month: '',
        criteria: 'Both',
        departments: [],
        tags: []
      });
      // Success modal or redirect back? Let's use a nice success modal layout like AdminNewsEditor
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={onBack} className="material-symbols-outlined text-outline hover:text-primary transition-colors">arrow_back</button>
            <span className="bg-primary/10 text-primary text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">Events Manager</span>
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-primary">Post New Event</h1>
          <p className="text-on-surface-variant font-medium text-sm">Reach the entire Smart League network with your institution's latest events.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Step 1: Core Details */}
            <section className="bg-white rounded-[2.5rem] border border-outline-variant/20 p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">info</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-primary">Event Information</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-outline bg-surface-container px-3 py-1 rounded-full">Step 1 of 3</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 group">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline group-focus-within:text-primary transition-colors">Event Title</label>
                  <input 
                    type="text" 
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    required
                    className="w-full bg-surface-container border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-xl font-bold text-primary placeholder:text-outline-variant/50 transition-all py-3 px-4 rounded-t-xl" 
                    placeholder="e.g. Inter-College Tech Symposium 2024" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Description</label>
                  <textarea 
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    required
                    className="w-full bg-surface-container border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 rounded-t-xl py-4 px-4 font-body leading-relaxed text-sm font-medium" 
                    placeholder="Provide a compelling description of the event, its objectives, and key highlights..." 
                    rows="4"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Exact Date</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50 text-sm">calendar_today</span>
                      <input 
                        type="date" 
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        required
                        className="w-full bg-surface-container border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 rounded-t-xl py-3 pl-10 pr-4 font-bold text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Event Month</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50 text-sm">date_range</span>
                      <input 
                        type="month" 
                        value={form.month}
                        onChange={e => setForm({...form, month: e.target.value})}
                        required
                        className="w-full bg-surface-container border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 rounded-t-xl py-3 pl-10 pr-4 font-bold text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Participation */}
            <section className="bg-white rounded-[2.5rem] border border-outline-variant/20 p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-primary">Participation</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-outline bg-surface-container px-3 py-1 rounded-full">Step 2 of 3</span>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Academic Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['UG', 'PG', 'Both'].map(crit => (
                      <button
                        type="button"
                        key={crit}
                        onClick={() => setForm({...form, criteria: crit})}
                        className={`py-3 rounded-2xl text-xs font-black transition-all border-2 ${form.criteria === crit ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}
                      >
                        {crit === 'UG' ? 'Undergraduate' : crit === 'PG' ? 'Postgraduate' : 'Both'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Target Departments</label>
                  <div className="flex flex-wrap gap-2">
                    {availableDepartments.map(dept => (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => handleCheckboxChange(dept)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${form.departments.includes(dept) ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: Categorization & Tags */}
            <section className="bg-white rounded-[2.5rem] border border-outline-variant/20 p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">sell</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-primary">Tags & Categorization</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-outline bg-surface-container px-3 py-1 rounded-full">Step 3 of 3</span>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Suggested Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {defaultTags.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${form.tags.includes(tag) ? 'bg-amber-100 border-amber-400 text-amber-800 scale-105' : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high'}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-outline">Custom Tags</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline/50 text-sm">add_circle</span>
                      <input 
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={addCustomTag}
                        className="w-full bg-surface-container border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 rounded-t-xl py-3 pl-10 pr-4 font-bold text-sm"
                        placeholder="Type a tag and press Enter..."
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={addCustomTag}
                      className="bg-primary text-on-primary px-6 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-2 bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-black tracking-tight animate-scale-in">
                          #{tag}
                          <button 
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="material-symbols-outlined text-[14px] hover:text-error transition-colors"
                          >
                            close
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Form Footer */}
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <button 
                type="button"
                onClick={onBack}
                className="text-sm font-black text-outline hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">close</span> Cancel & Discard
              </button>
              
              <button 
                type="submit" 
                disabled={loading || !form.title || !form.description}
                className="w-full md:w-auto bg-primary text-on-primary px-12 py-4 rounded-full font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">publish</span>}
                {loading ? 'Publishing Event...' : 'Publish Event Now'}
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-outline">Card Preview</h4>
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-green-600 animate-pulse"></span> Live
              </span>
            </div>

            <div className="bg-white rounded-[2rem] border border-outline-variant/30 shadow-2xl overflow-hidden group hover:border-primary/50 transition-all">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Event</span>
                  <div className="flex gap-1">
                    {form.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-bold text-outline">#{tag}</span>
                    ))}
                  </div>
                </div>
                
                <h5 className="font-headline text-lg font-black text-primary leading-tight min-h-[3rem] line-clamp-2">
                  {form.title || 'Your Event Title Here'}
                </h5>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                    {form.date ? new Date(form.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                    {form.criteria} Participation
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-on-surface-variant line-clamp-3 min-h-[3rem]">
                  {form.description || 'Provide a compelling description of your event to attract participants...'}
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-outline-variant/10">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-[8px] font-bold text-outline">
                        {userProfile?.institution?.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Details</button>
                </div>
              </div>
            </div>

            {/* Success Animation Container */}
            {showSuccess && (
              <div className="bg-green-600 text-white p-6 rounded-[2rem] shadow-xl animate-scale-in text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-white text-3xl">check</span>
                </div>
                <div>
                  <h5 className="font-bold">Successfully Published!</h5>
                  <p className="text-xs opacity-90">Your event is now live on the public feed.</p>
                </div>
                <button 
                  onClick={onBack}
                  className="w-full bg-white text-green-600 py-3 rounded-xl text-xs font-black shadow-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal (Mobile-friendly) */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] lg:hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 animate-scale-in border border-primary/10">
            <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-600/30">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-primary">Published!</h2>
              <p className="text-on-surface-variant font-medium mt-2">Your event is now visible to everyone.</p>
            </div>
            <button 
              onClick={onBack}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-black shadow-lg shadow-primary/20"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
