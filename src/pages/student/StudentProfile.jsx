import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStudentBySlug, getNewsPosts } from '../../firebase/firestore';

export const StudentProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await getStudentBySlug(slug);
        if (studentData) {
          setStudent(studentData);
          // Fetch published achievements for this student (legacy + new array format)
          const qNewsLegacy = await getNewsPosts({ status: 'published', studentSlug: slug });
          const qNewsNew = await getNewsPosts({ status: 'published', studentSlugs: slug });
          
          const merged = [...qNewsLegacy, ...qNewsNew];
          const uniqueNews = Array.from(new Map(merged.map(item => [item.id, item])).values());
          
          setAchievements(uniqueNews.sort((a,b) => {
            const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
            const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
            return tB - tA;
          }));
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-bold animate-pulse font-headline">Curating Portfolio...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-6">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">person_off</span>
        <h1 className="text-2xl font-headline font-extrabold text-primary mb-2">Student Not Found</h1>
        <p className="text-on-surface-variant mb-6">The student profile you're looking for doesn't exist or hasn't been set up yet.</p>
        <Link to="/feed" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-container antialiased">
      {/* TopAppBar */}
      <header className="docked full-width top-0 sticky z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full border-b border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
            <img 
              alt="Student" 
              className="w-full h-full object-cover" 
              src={student.imageUrl || student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=002045&color=fff`} 
            />
          </div>
          <h1 onClick={() => navigate('/')} className="text-xl font-bold text-blue-900 dark:text-white tracking-tight font-headline cursor-pointer">Smart League</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/feed" className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-inter hover:bg-slate-200/50 transition-colors px-2 py-1 rounded">Home</Link>
            <Link to="/explore" className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-inter hover:bg-slate-200/50 transition-colors px-2 py-1 rounded">Explore</Link>
            <span className="text-blue-900 dark:text-white font-black text-xs uppercase tracking-wider border-b-2 border-primary pb-1">Portfolio</span>
          </nav>
          <button className="p-2 rounded-full hover:bg-slate-200/50 active:scale-95 duration-150">
            <span className="material-symbols-outlined text-blue-900">search</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        {/* Profile Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-end">
          <div className="lg:col-span-7">
            <span className="label-md text-xs font-black uppercase tracking-[0.3em] text-on-tertiary-container mb-4 block">Distinguished Scholar</span>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-primary leading-none mb-6">
              {student.name.split(' ')[0]} <br/>
              <span className="text-on-primary-container">{student.name.split(' ').slice(1).join(' ')}</span>
            </h2>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="bg-surface-container-low px-4 py-2 rounded-lg text-primary font-bold text-sm flex items-center gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-base">account_balance</span>
                {student.institution}
              </span>
              <span className="bg-surface-container-low px-4 py-2 rounded-lg text-primary font-bold text-sm flex items-center gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-base">architecture</span>
                {student.course || 'Academic Scholar'}
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-surface-container-highest transform rotate-2 shadow-2xl transition-transform hover:rotate-0 duration-700">
              <img 
                alt={student.name} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                src={student.imageUrl || student.image || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80'} 
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-secondary-container p-8 rounded-2xl shadow-xl max-w-[220px] border border-white/20">
              <p className="font-headline text-4xl font-black text-on-secondary-fixed">GPA {student.gpa || '4.0'}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-secondary-fixed-variant mt-1">Summa Cum Laude</p>
            </div>
          </div>
        </section>

        {/* Portfolio Summary Bento Grid */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Signature Work */}
            <div className="md:col-span-2 md:row-span-2 bg-primary text-white p-10 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="relative z-10">
                <span className="text-on-primary-container text-[10px] font-black uppercase tracking-[0.4em]">Signature Work</span>
                <h3 className="font-headline text-3xl font-extrabold mt-6 leading-tight">
                  {achievements[0]?.title || 'Awaiting Masterwork'}
                </h3>
                <p className="mt-4 text-primary-fixed-dim/80 font-medium leading-relaxed">
                  {achievements[0]?.description?.substring(0, 150) || 'This student is currently developing their signature research project for the 2024 academic cycle.'}...
                </p>
              </div>
              <div className="mt-12 flex gap-3 relative z-10">
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Research</span>
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">2024</span>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Metric Cards */}
            <div className="bg-surface-container-low p-8 rounded-[2rem] group hover:bg-surface-container-high transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-4xl text-on-tertiary-container mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
              <p className="text-5xl font-headline font-black text-primary">{achievements.length}</p>
              <p className="text-xs font-black uppercase tracking-widest text-outline mt-2">Verified Projects</p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2rem] group hover:bg-surface-container-high transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-4xl text-secondary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <p className="text-5xl font-headline font-black text-primary">{student.supporters || '12'}</p>
              <p className="text-xs font-black uppercase tracking-widest text-outline mt-2">Supporters</p>
            </div>

            {/* Visual Accent Card */}
            <div className="md:col-span-2 bg-surface-container rounded-[2rem] p-10 flex items-center justify-between overflow-hidden border border-outline-variant/10 shadow-sm">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-2">Global Influence</p>
                <h4 className="font-headline text-3xl font-extrabold text-primary leading-tight">Published <br/>Insights</h4>
                <button className="mt-6 text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 group">
                  View Full Journal 
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
              <div className="w-32 h-44 rounded-xl bg-white p-3 rotate-6 shadow-2xl border border-outline-variant/10 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-surface-container-low rounded-lg flex items-center justify-center border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-primary/20 text-4xl">auto_stories</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trophy Case */}
        <section className="mb-24">
          <div className="flex items-baseline justify-between mb-12">
            <h3 className="font-headline text-4xl font-extrabold text-primary tracking-tight">Trophy Case</h3>
            <div className="h-px flex-grow mx-8 bg-outline-variant/30"></div>
            <span className="text-xs font-black uppercase tracking-widest text-outline">Verified Scholastic Records</span>
          </div>
          
          <div className="space-y-6">
            {achievements.length > 0 ? achievements.map((item, idx) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/achievement/${item.postSlug || item.id}`)}
                className="flex flex-col md:flex-row gap-8 md:items-center p-10 rounded-[2.5rem] bg-white border border-outline-variant/10 group hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
              >
                <div className="text-outline font-headline font-black text-2xl w-24 opacity-40">
                  {item.createdAt?.toDate?.() ? item.createdAt.toDate().getFullYear() : '2024'}
                </div>
                <div className="flex-grow space-y-2">
                  <h5 className="font-headline text-2xl font-extrabold text-primary group-hover:text-primary-container transition-colors">{item.title}</h5>
                  <p className="text-on-surface-variant font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-primary/5 text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    {item.category}
                  </span>
                </div>
                {item.imageUrl && (
                  <div className="w-32 h-20 rounded-2xl overflow-hidden shrink-0 border border-outline-variant/10">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )) : (
              <div className="p-20 text-center bg-surface-container-low rounded-[2.5rem] border border-dashed border-outline-variant/30">
                 <span className="material-symbols-outlined text-5xl text-outline/30 mb-4">award_star</span>
                 <p className="text-on-surface-variant font-headline text-xl font-bold">Awaiting first major distinction.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl z-50 rounded-t-[2.5rem] shadow-2xl border-t border-outline-variant/10 md:hidden">
        <Link to="/feed" className="flex flex-col items-center justify-center text-slate-400 px-4 py-2">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Home</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center justify-center text-slate-400 px-4 py-2">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Explore</span>
        </Link>
        <div className="flex flex-col items-center justify-center bg-blue-900 text-white rounded-full px-6 py-2 scale-110 shadow-lg shadow-blue-900/20">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Portfolio</span>
        </div>
        <Link to="/notifications" className="flex flex-col items-center justify-center text-slate-400 px-4 py-2">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Activity</span>
        </Link>
      </nav>
    </div>
  );
};
