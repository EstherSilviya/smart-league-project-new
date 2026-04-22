import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminNewsEditor } from './AdminNewsEditor';
import { StaffView } from './AdminStaff';
import { AdminStudentEdit } from './AdminStudentEdit';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, onSnapshot } from 'firebase/firestore';
import { sendEmail } from '../../utils/emailService';
import { db } from '../../firebase/config';
import { getNewsPosts, getAdminStats, getStudentBySlug } from '../../firebase/firestore';
 
const DashboardView = ({ institution }) => {
  const [stats, setStats] = useState({ totalStudents: 0, totalNews: 0, totalAchievements: 0 });
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats(institution);
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [institution]);
 
  const cards = [
    { label: 'Students', value: stats.totalStudents, icon: 'school', color: 'bg-blue-50 text-blue-600' },
    { label: 'Published News', value: stats.totalNews, icon: 'article', color: 'bg-purple-50 text-purple-600' },
    { label: 'Achievements', value: stats.totalAchievements, icon: 'workspace_premium', color: 'bg-amber-50 text-amber-600' },
  ];
 
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tighter text-primary">Dashboard Overview</h2>
        <p className="text-on-surface-variant mt-1">Management insights for <strong>{institution}</strong>.</p>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-outline uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-primary">{loading ? '...' : card.value}</p>
            </div>
          </div>
        ))}
      </div>
 
      <div className="bg-primary text-white p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-2xl font-bold mb-2">Welcome to Smart League Admin</h3>
          <p className="text-primary-fixed opacity-80 text-sm leading-relaxed">
            As a manager for {institution}, you can control how your students achievements are showcased to the world.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-container rounded-full blur-3xl opacity-20"></div>
      </div>
    </div>
  );
};
 
const StudentsView = ({ institution, onEdit }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), where('institution', '==', institution));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Robust sort handling both Firestore Timestamp and JS Date
        setStudents(data.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
          return tB - tA;
        }));
      } catch (err) {
        console.error("Error fetching students:", err);
      }
      setLoading(false);
    };
    fetchStudents();
  }, [institution]);
 
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-primary">Student Directory</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage and view scholastic portfolios for {institution}.</p>
        </div>
        <div className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
          {students.length} Registered Students
        </div>
      </div>
 
      <div className="bg-white rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Student Profile</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Course & Year</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Roll No</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-8 py-10"><div className="h-4 bg-surface-container rounded w-full" /></td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-on-surface-variant font-medium">No students registered yet.</td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant/10 bg-surface-container">
                        <img 
                          src={student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
                          alt={student.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-primary">{student.name}</p>
                        <p className="text-xs text-on-surface-variant">@{student.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-primary-container bg-primary-container/10 px-3 py-1 rounded-full">{student.courseYear || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-mono text-outline">{student.rollNo || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-6">
                    {student.profileCompleted ? (
                      <span className="flex items-center gap-1.5 text-secondary font-bold text-[10px] uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-outline font-bold text-[10px] uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-outline/30"></span>
                        Pending Setup
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(`/profile/${student.slug}`, '_blank')}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                      <button 
                        onClick={() => onEdit(student.slug)}
                        className="p-2 rounded-lg hover:bg-secondary/10 text-secondary transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
const DraftsView = ({ institution, onEdit }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const data = await getNewsPosts({ 
          status: 'draft',
          institution: institution
        });
        setDrafts(data);
      } catch (err) {
        console.error("Error fetching drafts:", err);
      }
      setLoading(false);
    };
    fetchDrafts();
  }, [institution]);
 
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tighter text-primary">My Drafts</h2>
        <p className="text-on-surface-variant text-sm mt-1">Unfinished stories and archives for {institution}.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-3xl animate-pulse" />)}
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-surface-container-low p-16 rounded-[2.5rem] text-center border border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl text-outline/30 mb-4">edit_note</span>
            <p className="text-on-surface-variant font-bold">No drafts saved.</p>
          </div>
        ) : (
          drafts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-3xl border border-outline-variant/10 flex items-center justify-between hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase bg-surface-container-highest text-on-surface-variant tracking-widest">
                    {post.status}
                  </span>
                  {post.category && <span className="text-[10px] font-black text-on-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded uppercase tracking-widest">{post.category}</span>}
                </div>
                <h3 className="font-headline font-bold text-lg text-primary line-clamp-1">{post.title || 'Untitled Draft'}</h3>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 font-medium">{post.description || 'No description yet...'}</p>
              </div>
              <button 
                onClick={() => onEdit(post.id)}
                className="material-symbols-outlined text-primary p-3 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                edit
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
 
const PublishedView = ({ institution }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const data = await getNewsPosts({ 
          status: 'published',
          institution: institution
        });
        setPosts(data);
      } catch (err) {
        console.error("Error fetching published posts:", err);
      }
      setLoading(false);
    };
    fetchPublished();
  }, [institution]);
 
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-primary">Published Content</h2>
          <p className="text-on-surface-variant text-sm mt-1">Live updates and achievements from {institution}.</p>
        </div>
        <div className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          {posts.length} Live Stories
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-3xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-surface-container-low p-16 rounded-[2.5rem] text-center border border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl text-outline/30 mb-4">auto_stories</span>
            <p className="text-on-surface-variant font-bold">No published posts yet.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-3xl border border-outline-variant/10 flex items-center gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer">
              {post.imageURL ? (
                <img src={post.imageURL} alt={post.title} className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-md" />
              ) : (
                <div className="w-24 h-24 bg-surface-container-high rounded-2xl flex items-center justify-center shrink-0 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary/20 text-3xl">article</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase bg-secondary-container text-on-secondary-fixed-variant tracking-widest">
                    {post.status}
                  </span>
                  {post.category && <span className="text-[10px] font-black text-on-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded uppercase tracking-widest">{post.category}</span>}
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest ml-auto">
                    {post.createdAt?.toDate?.() ? post.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-primary line-clamp-1">{post.title}</h3>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 font-medium leading-relaxed opacity-80">{post.description}</p>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="material-symbols-outlined text-primary p-2 bg-primary/5 rounded-lg hover:bg-primary hover:text-white transition-all">visibility</button>
                <button className="material-symbols-outlined text-error p-2 bg-error/5 rounded-lg hover:bg-error hover:text-white transition-all">delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
 
// ─── ANALYTICS VIEW ───────────────────────────────────────────────────────────
// What does Analytics tell you?
// 1. OVERVIEW STATS — total students, posts published, drafts, total achievements
// 2. CATEGORY BREAKDOWN — which achievement categories (sports/academic/arts) are most common
// 3. MONTHLY ACTIVITY — how many posts/students were added each month (last 6 months)
// 4. TOP STUDENTS — students with the most achievements
// 5. CONTENT STATUS — ratio of published vs draft vs pending posts
// All data is fetched live from Firebase in real-time using onSnapshot listeners.
 
const AnalyticsView = ({ institution }) => {
  const [stats, setStats] = useState({ totalStudents: 0, totalPublished: 0, totalDrafts: 0, totalAchievements: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [statusData, setStatusData] = useState({ published: 0, draft: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [engagementChartType, setEngagementChartType] = useState('bar'); // 'bar' | 'line'
  const [engagementData, setEngagementData] = useState([
    { label: 'MON', value: 0 },
    { label: 'TUE', value: 0 },
    { label: 'WED', value: 0 },
    { label: 'THU', value: 0 },
    { label: 'FRI', value: 0 },
    { label: 'SAT', value: 0 },
    { label: 'SUN', value: 0 },
  ]);
 
  // Helper: convert Firestore timestamp to JS Date safely
  const toDate = (ts) => {
    if (!ts) return new Date(0);
    if (ts.toDate) return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  };
 
  useEffect(() => {
    if (!institution) return;
 
    // ── Real-time listener for news posts ──
    const newsConstraints = [where('institution', '==', institution)];
    const newsQuery = query(collection(db, 'news'), ...newsConstraints);
 
    // ── Real-time listener for students ──
    const studentsQuery = query(collection(db, 'students'), where('institution', '==', institution));
 
    let newsData = [];
    let studentsData = [];
 
    const processAll = () => {
      // 1. Overview stats
      const published = newsData.filter(p => p.status === 'published').length;
      const drafts = newsData.filter(p => p.status === 'draft').length;
      const pending = newsData.filter(p => p.status === 'pending').length;
      setStats({
        totalStudents: studentsData.length,
        totalPublished: published,
        totalDrafts: drafts,
        totalAchievements: newsData.filter(p => p.status === 'published').length,
      });
 
      // 2. Status breakdown
      setStatusData({ published, draft: drafts, pending });
 
      // 3. Category breakdown from published posts
      const catMap = {};
      newsData.filter(p => p.status === 'published').forEach(p => {
        const cat = p.category || 'Uncategorized';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const catArr = Object.entries(catMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setCategoryData(catArr);
 
      // 4. Monthly activity (last 6 months) — count posts created each month
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          label: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth(),
          posts: 0,
          students: 0,
        };
      });
      newsData.forEach(p => {
        const d = toDate(p.createdAt);
        const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
        if (idx !== -1) months[idx].posts += 1;
      });
      studentsData.forEach(s => {
        const d = toDate(s.createdAt);
        const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
        if (idx !== -1) months[idx].students += 1;
      });
      setMonthlyData(months);
 
      // 5. Top students by number of published posts
      const studentPostCount = {};
      newsData.filter(p => p.status === 'published' && p.studentSlug).forEach(p => {
        const key = p.studentSlug;
        if (!studentPostCount[key]) studentPostCount[key] = { slug: key, name: p.studentName || key, count: 0 };
        studentPostCount[key].count += 1;
      });
      const top = Object.values(studentPostCount).sort((a, b) => b.count - a.count).slice(0, 5);
      setTopStudents(top);
 
      // 6. Engagement Over Time — count posts by day of week (last 30 days)
      const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      newsData.forEach(p => {
        const d = toDate(p.createdAt);
        if (d >= thirtyDaysAgo) {
          // getDay() returns 0=Sun,1=Mon,...,6=Sat — map to MON-SUN order
          const jsDay = d.getDay(); // 0=Sun
          const idx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 ... Sun=6
          dayCounts[idx] += 1;
        }
      });
      studentsData.forEach(s => {
        const d = toDate(s.createdAt);
        if (d >= thirtyDaysAgo) {
          const jsDay = d.getDay();
          const idx = jsDay === 0 ? 6 : jsDay - 1;
          dayCounts[idx] += 1;
        }
      });
      setEngagementData(dayLabels.map((label, i) => ({ label, value: dayCounts[i] })));
 
      setLastUpdated(new Date());
      setLoading(false);
    };
 
    const unsubNews = onSnapshot(newsQuery, (snap) => {
      newsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      processAll();
    });
 
    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      studentsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      processAll();
    });
 
    return () => { unsubNews(); unsubStudents(); };
  }, [institution]);
 
  // Bar chart max value for scaling
  const maxPosts = Math.max(...monthlyData.map(m => m.posts), 1);
  const maxStudents = Math.max(...monthlyData.map(m => m.students), 1);
  const totalStatus = statusData.published + statusData.draft + statusData.pending || 1;
 
  // Category colors
  const catColors = [
    'bg-blue-500', 'bg-purple-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500',
  ];
 
  if (loading) return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tighter text-primary">Analytics</h2>
        <p className="text-on-surface-variant text-sm mt-1">Loading real-time data for {institution}...</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-surface-container-low rounded-[2rem] animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-surface-container-low rounded-[2rem] animate-pulse" />)}
      </div>
    </div>
  );
 
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-primary">Analytics</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time performance insights for <strong>{institution}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live · {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}
        </div>
      </div>
 
      {/* ── Overview Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: 'school', bg: 'bg-blue-50', text: 'text-blue-600', desc: 'Registered profiles' },
          { label: 'Published Posts', value: stats.totalPublished, icon: 'auto_stories', bg: 'bg-emerald-50', text: 'text-emerald-600', desc: 'Live on the feed' },
          { label: 'Drafts', value: stats.totalDrafts, icon: 'edit_note', bg: 'bg-amber-50', text: 'text-amber-600', desc: 'Work in progress' },
          { label: 'Total Achievements', value: stats.totalAchievements, icon: 'workspace_premium', bg: 'bg-purple-50', text: 'text-purple-600', desc: 'Across all categories' },
        ].map(card => (
          <div key={card.label} className="bg-white p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm">
            <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.text} flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined text-xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-black text-primary">{card.value}</p>
            <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">{card.label}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">{card.desc}</p>
          </div>
        ))}
      </div>
 
      {/* ── Engagement Over Time Chart (matches CEO design) ── */}
      {(() => {
        const maxEngagement = Math.max(...engagementData.map(d => d.value), 1);
        const peakIdx = engagementData.reduce((best, d, i) => d.value > engagementData[best].value ? i : best, 0);
        // Line chart SVG path
        const chartW = 560;
        const chartH = 160;
        const padX = 10;
        const points = engagementData.map((d, i) => {
          const x = padX + (i / (engagementData.length - 1)) * (chartW - padX * 2);
          const y = chartH - (d.value / maxEngagement) * chartH * 0.85 - 10;
          return { x, y, ...d };
        });
        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH + 10} L ${points[0].x} ${chartH + 10} Z`;
 
        return (
          <div className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm p-8">
            {/* Header row — matches image exactly */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-extrabold text-primary text-xl">Engagement Over Time</h3>
                <p className="text-xs text-on-surface-variant mt-1">Daily interaction metrics across all portals</p>
              </div>
              {/* Line / Bar toggle — matches image */}
              <div className="flex items-center bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
                <button
                  onClick={() => setEngagementChartType('line')}
                  className={`px-4 py-2 text-xs font-bold transition-all ${engagementChartType === 'line' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Line
                </button>
                <button
                  onClick={() => setEngagementChartType('bar')}
                  className={`px-4 py-2 text-xs font-bold transition-all ${engagementChartType === 'bar' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Bar
                </button>
              </div>
            </div>
 
            {/* Chart area */}
            <div className="relative" style={{ height: '200px' }}>
              {engagementChartType === 'bar' ? (
                /* ── BAR CHART (matches image: light grey bars, navy peak) ── */
                <div className="flex items-end gap-2 h-full pb-6">
                  {engagementData.map((d, i) => {
                    const isPeak = i === peakIdx && d.value > 0;
                    const heightPct = maxEngagement > 0 ? Math.max((d.value / maxEngagement) * 100, d.value > 0 ? 8 : 2) : 2;
                    return (
                      <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="relative w-full flex flex-col justify-end" style={{ height: 'calc(100% - 20px)' }}>
                          {/* Peak tooltip — matches image exactly */}
                          {isPeak && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap z-10 shadow-md">
                              Peak
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
                            </div>
                          )}
                          {/* Hover value tooltip */}
                          {!isPeak && d.value > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {d.value}
                            </div>
                          )}
                          {/* Bar — light grey normally, navy for peak (matches image) */}
                          <div
                            className={`w-full rounded-t-lg transition-all duration-700 ${isPeak ? 'bg-primary' : 'bg-surface-container-high hover:bg-primary/30'}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── LINE CHART (SVG smooth line with area fill) ── */
                <div className="relative w-full h-full">
                  <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0.25, 0.5, 0.75, 1].map(pct => (
                      <line
                        key={pct}
                        x1={0} y1={chartH - pct * chartH * 0.85}
                        x2={chartW} y2={chartH - pct * chartH * 0.85}
                        stroke="#e9e7eb" strokeWidth="1" strokeDasharray="4 4"
                      />
                    ))}
                    {/* Area fill */}
                    <path d={areaPath} fill="rgba(0,32,69,0.06)" />
                    {/* Line */}
                    <path d={linePath} fill="none" stroke="#002045" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Dots + peak label */}
                    {points.map((p, i) => {
                      const isPeak = i === peakIdx && p.value > 0;
                      return (
                        <g key={p.label}>
                          <circle cx={p.x} cy={p.y} r={isPeak ? 5 : 4} fill={isPeak ? '#002045' : '#fff'} stroke="#002045" strokeWidth="2" />
                          {isPeak && (
                            <>
                              <rect x={p.x - 18} y={p.y - 22} width={36} height={16} rx={4} fill="#002045" />
                              <text x={p.x} y={p.y - 11} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">Peak</text>
                            </>
                          )}
                          {/* Day label */}
                          <text x={p.x} y={chartH + 22} textAnchor="middle" fill="#74777f" fontSize={9} fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {p.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
 
            {/* Footer note */}
            <p className="text-[10px] text-outline uppercase tracking-widest mt-2 text-right">
              Based on posts & students added in the last 30 days
            </p>
          </div>
        );
      })()}
 
      {/* ── Row 2: Monthly Activity + Content Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
        {/* Monthly Activity Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-extrabold text-primary text-lg">Monthly Activity</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Posts published & students added per month</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary inline-block"></span>Posts</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-secondary-container inline-block"></span>Students</span>
            </div>
          </div>
 
          {/* Bar chart */}
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end h-32">
                  {/* Posts bar */}
                  <div className="flex-1 flex flex-col justify-end">
                    <div
                      className="bg-primary rounded-t-lg transition-all duration-700 relative group"
                      style={{ height: `${Math.max((m.posts / maxPosts) * 100, m.posts > 0 ? 8 : 0)}%` }}
                    >
                      {m.posts > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {m.posts}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Students bar */}
                  <div className="flex-1 flex flex-col justify-end">
                    <div
                      className="bg-secondary-container rounded-t-lg transition-all duration-700 relative group"
                      style={{ height: `${Math.max((m.students / maxStudents) * 100, m.students > 0 ? 8 : 0)}%` }}
                    >
                      {m.students > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {m.students}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{m.label}</span>
              </div>
            ))}
          </div>
 
          {/* Zero state */}
          {monthlyData.every(m => m.posts === 0 && m.students === 0) && (
            <div className="text-center text-on-surface-variant text-sm mt-4">No activity data yet. Start publishing posts!</div>
          )}
        </div>
 
        {/* Content Status Donut */}
        <div className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm p-8">
          <h3 className="font-extrabold text-primary text-lg mb-1">Content Status</h3>
          <p className="text-xs text-on-surface-variant mb-6">Breakdown of all your posts</p>
 
          {/* Simple visual bars instead of SVG donut for reliability */}
          <div className="space-y-4">
            {[
              { label: 'Published', value: statusData.published, total: totalStatus, color: 'bg-emerald-500' },
              { label: 'Drafts', value: statusData.draft, total: totalStatus, color: 'bg-amber-400' },
              { label: 'Pending', value: statusData.pending, total: totalStatus, color: 'bg-blue-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-primary">{item.value}</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${(item.value / item.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-outline mt-0.5 text-right">{Math.round((item.value / item.total) * 100)}%</p>
              </div>
            ))}
          </div>
 
          <div className="mt-6 pt-5 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant text-center">
              Total: <span className="font-black text-primary">{statusData.published + statusData.draft + statusData.pending}</span> posts
            </p>
          </div>
        </div>
      </div>
 
      {/* ── Row 3: Category Breakdown + Top Students ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
        {/* Category Breakdown */}
        <div className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm p-8">
          <h3 className="font-extrabold text-primary text-lg mb-1">Achievement Categories</h3>
          <p className="text-xs text-on-surface-variant mb-6">Which categories your posts cover most</p>
 
          {categoryData.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-4xl text-outline/30 mb-2">category</span>
              <p>No published posts yet to show categories.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryData.map((cat, i) => {
                const maxCount = categoryData[0].count || 1;
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${catColors[i % catColors.length]} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-xs font-black">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-on-surface">{cat.name}</span>
                        <span className="text-sm font-black text-primary">{cat.count}</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${catColors[i % catColors.length]} transition-all duration-700`}
                          style={{ width: `${(cat.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
 
        {/* Top Students */}
        <div className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm p-8">
          <h3 className="font-extrabold text-primary text-lg mb-1">Top Students</h3>
          <p className="text-xs text-on-surface-variant mb-6">Students with the most published achievements</p>
 
          {topStudents.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-4xl text-outline/30 mb-2">emoji_events</span>
              <p>No student data yet. Publish posts linked to students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topStudents.map((s, i) => (
                <div key={s.slug} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container-low transition-colors">
                  {/* Rank badge */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0
                    ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-surface-container-high text-outline'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
 
                  {/* Avatar */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&size=64`}
                    alt={s.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-outline-variant/10"
                  />
 
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary text-sm truncate">{s.name}</p>
                    <p className="text-[10px] text-outline uppercase tracking-widest">@{s.slug}</p>
                  </div>
 
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className="font-black text-primary text-sm">{s.count}</span>
                    <span className="text-[10px] text-outline">posts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* ── Info Banner: What Analytics Tells You ── */}
      <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-primary text-xl">info</span>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-2">What does Analytics show you?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
              {[
                '📊 Total students, posts & achievements at a glance',
                '📅 Monthly trend of posts published & students added',
                '🏷️ Which achievement categories you cover most',
                '🏆 Your top students ranked by published achievements',
                '📝 Content status split — published, drafts & pending',
                '🔴 All data updates live from Firebase in real-time',
              ].map(point => (
                <p key={point} className="text-sm text-on-surface-variant">{point}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export const AdminPortal = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentSlug, setSelectedStudentSlug] = useState(null);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
 
  const handleEditStudent = (slug) => {
    setSelectedStudentSlug(slug);
    setActiveTab('student-edit');
  };
 
  const isEditor = activeTab === 'new-post' || activeTab === 'student-edit';
 
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex justify-between items-center px-8 h-16 w-full max-w-[1920px] mx-auto font-manrope tracking-tight">
          <div className="text-xl font-bold tracking-tighter text-primary">Smart League</div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setActiveTab('dashboard')} className={`font-semibold pb-1 transition-colors ${activeTab === 'dashboard' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}>Overview</button>
            <button onClick={() => setActiveTab('published')} className={`font-semibold pb-1 transition-colors ${activeTab === 'published' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}>Newsroom</button>
            {(userProfile?.role === 'admin' || userProfile?.role === 'management') && (
              <button onClick={() => setActiveTab('staff')} className={`font-semibold pb-1 transition-colors ${activeTab === 'staff' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}>Staff</button>
            )}
            <button onClick={() => setActiveTab('students')} className={`font-semibold pb-1 transition-colors ${activeTab === 'students' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-primary'}`}>Students</button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>
            </div>
            <button onClick={() => setActiveTab('new-post')} className="bg-primary text-on-primary px-6 py-2 rounded-full font-semibold transition-all hover:opacity-90 active:scale-95 text-sm">
              Publish News
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase">
              {userProfile?.displayName?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </nav>
 
      {/* SideNavBar */}
      {!isEditor && (
        <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-16 border-r border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 z-40">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary leading-tight">Admin Portal</h2>
                <p className="text-xs text-slate-500 font-inter">{userProfile?.institution || 'Institution'}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
                { id: 'drafts', icon: 'edit_note', label: 'Drafts' },
                { id: 'published', icon: 'auto_stories', label: 'Published' },
                { id: 'staff', icon: 'badge', label: 'Staff Management', managementOnly: true },
                { id: 'students', icon: 'leaderboard', label: 'Students' },
                { id: 'analytics', icon: 'analytics', label: 'Analytics' },
              ].map(item => {
                if (item.managementOnly && userProfile?.role !== 'management' && userProfile?.role !== 'teacher') return null;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center space-x-3 pl-6 py-3 transition-all ${isActive ? 'bg-primary-fixed text-on-primary-fixed rounded-r-full mr-4' : 'text-slate-600 hover:bg-surface-container-high hover:translate-x-1'}`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-inter text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-8 px-6">
              <button onClick={() => setActiveTab('new-post')} className="w-full bg-secondary-container text-on-secondary-container font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center space-x-2">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Create New Draft</span>
              </button>
            </div>
          </div>
          <div className="mt-auto p-6 space-y-1">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 text-error pl-6 py-3 hover:bg-error-container/20 transition-all">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-inter text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </aside>
      )}
 
      {/* Main Content Area */}
      <main className={`${!isEditor ? 'lg:ml-64' : ''} pt-16 min-h-screen`}>
        {activeTab === 'dashboard' && <DashboardView institution={userProfile?.institution} />}
        {activeTab === 'students' && <StudentsView institution={userProfile?.institution} onEdit={handleEditStudent} />}
        {activeTab === 'drafts' && <DraftsView institution={userProfile?.institution} />}
        {activeTab === 'published' && <PublishedView institution={userProfile?.institution} />}
        {activeTab === 'staff' && <StaffView />}
        {activeTab === 'analytics' && <AnalyticsView institution={userProfile?.institution} />}
        {activeTab === 'new-post' && <AdminNewsEditor onBack={() => setActiveTab('dashboard')} />}
        {activeTab === 'student-edit' && (
          <AdminStudentEdit 
            slug={selectedStudentSlug} 
            onBack={() => setActiveTab('students')} 
          />
        )}
      </main>
    </div>
  );
};
