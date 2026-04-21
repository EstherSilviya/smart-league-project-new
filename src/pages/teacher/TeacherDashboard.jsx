// src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStudents, getAchievements, getNewsPosts } from '../../firebase/firestore';

const TopBar = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <span className="font-headline font-extrabold text-primary tracking-tight">Smart League</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline bg-surface-container-high px-2 py-0.5 rounded-full">Teacher</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {[
            { to: '/teacher', label: 'Dashboard' },
            { to: '/teacher/students', label: 'My Students' },
            { to: '/teacher/news', label: 'Newsroom' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-primary cursor-pointer">
            {(userProfile?.displayName || 'T')[0]}
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export const TeacherDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, a, n] = await Promise.all([
        getStudents(),
        getAchievements({ limit: 5 }),
        getNewsPosts({ authorId: currentUser.uid, limit: 5 }),
      ]);
      setStudents(s);
      setAchievements(a);
      setNews(n);
      setLoading(false);
    };
    load();
  }, [currentUser.uid]);

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-primary mb-1">
            Welcome, {userProfile?.displayName?.split(' ')[0] || 'Teacher'}
          </h1>
          <p className="text-on-surface-variant">{userProfile?.institution || 'Your institution'}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Assign Achievement', icon: 'workspace_premium', to: '/teacher/students', color: 'bg-primary text-on-primary' },
            { label: 'Publish News', icon: 'edit_note', to: '/teacher/news/new', color: 'bg-secondary-container text-on-secondary-fixed-variant' },
            { label: 'View Students', icon: 'school', to: '/teacher/students', color: 'bg-surface-container-low text-on-surface' },
            { label: 'My Profile', icon: 'person', to: '/profile', color: 'bg-surface-container-low text-on-surface' },
          ].map(({ label, icon, to, color }) => (
            <Link key={label} to={to}
              className={`${color} p-5 rounded-2xl flex flex-col gap-3 hover:opacity-90 active:scale-95 transition-all`}>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className="font-bold text-sm">{label}</p>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Students', value: students.length, icon: 'school' },
            { label: 'Achievements Awarded', value: achievements.length, icon: 'workspace_premium' },
            { label: 'My Posts', value: news.length, icon: 'auto_stories' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-1">
              <span className="material-symbols-outlined text-outline text-xl">{icon}</span>
              <p className="font-headline text-3xl font-extrabold text-primary">{loading ? '—' : value}</p>
              <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Students */}
          <div className="bg-surface-container-low rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-on-surface">Recent Students</h2>
              <Link to="/teacher/students" className="text-xs text-primary font-bold hover:underline">View All</Link>
            </div>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-xl mb-2 animate-pulse" />)
            ) : students.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-6">No students found.</p>
            ) : students.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-none">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {(s.displayName || 'S')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm">{s.displayName}</p>
                  <p className="text-xs text-on-surface-variant truncate">{s.institution}</p>
                </div>
                <button onClick={() => navigate(`/admin/achievements/assign/${s.id}`)}
                  className="text-xs text-primary font-bold hover:underline shrink-0">Award</button>
              </div>
            ))}
          </div>

          {/* Recent News */}
          <div className="bg-surface-container-low rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-on-surface">My Publications</h2>
              <Link to="/teacher/news" className="text-xs text-primary font-bold hover:underline">View All</Link>
            </div>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-xl mb-2 animate-pulse" />)
            ) : news.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-on-surface-variant text-sm mb-3">No posts yet.</p>
                <Link to="/teacher/news/new"
                  className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all">
                  Create First Post
                </Link>
              </div>
            ) : news.map(n => (
              <div key={n.id} className="flex items-center gap-3 py-3 border-b border-outline-variant/10 last:border-none">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-outline text-sm">article</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm line-clamp-1">{n.title}</p>
                  <span className={`text-[10px] font-bold uppercase ${n.status === 'published' ? 'text-on-tertiary-container' : 'text-outline'}`}>{n.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── TEACHER STUDENTS VIEW ────────────────────────────────────────────────────
export const TeacherStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { getStudents().then(d => { setStudents(d); setLoading(false); }); }, []);

  const filtered = students.filter(s =>
    !search || s.displayName?.toLowerCase().includes(search.toLowerCase()) || s.institution?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-primary">Students</h1>
            <p className="text-on-surface-variant text-sm">{students.length} students</p>
          </div>
          <div className="flex items-center bg-surface-container-low rounded-xl px-4 h-10 gap-2 focus-within:ring-2 ring-primary/30">
            <span className="material-symbols-outlined text-outline text-sm">search</span>
            <input className="bg-transparent border-none outline-none text-sm w-44"
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-surface-container-low rounded-2xl animate-pulse" />)
          ) : filtered.map(s => (
            <div key={s.id} className="bg-surface-container-low rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {s.photoURL ? (
                  <img src={s.photoURL} alt={s.displayName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-xl font-bold text-primary">
                    {(s.displayName || 'S')[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-on-surface">{s.displayName}</p>
                  <p className="text-xs text-on-surface-variant">{s.institution}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/profile/${s.id}`}
                  className="flex-1 text-center py-2 bg-surface-container-high rounded-xl text-xs font-bold hover:bg-surface-container transition-all">
                  View Profile
                </Link>
                <button onClick={() => navigate(`/admin/achievements/assign/${s.id}`)}
                  className="flex-1 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                  Award Achievement
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
