// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getNewsPosts, getAchievements } from '../../firebase/firestore';
import { AdminSidebar, AdminTopBar } from '../../components/Layout';

const StatCard = ({ label, value, icon, trend, color = 'primary', span = 1 }) => (
  <div className={`${span === 2 ? 'md:col-span-2' : ''} bg-surface-container-low p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between h-[200px]`}>
    <div className="relative z-10">
      <span className="label-md uppercase tracking-widest text-xs font-bold text-on-surface-variant">{label}</span>
      <h3 className="text-5xl font-extrabold text-primary mt-3 tracking-tighter">{value}</h3>
      {trend && <p className="text-on-tertiary-container font-medium mt-2 flex items-center gap-1 text-sm">
        <span className="material-symbols-outlined text-sm">trending_up</span>{trend}
      </p>}
    </div>
    <div className="absolute right-4 bottom-4 opacity-10">
      <span className="material-symbols-outlined text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalNews: 0, totalAchievements: 0 });
  const [recentNews, setRecentNews] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, n, a] = await Promise.all([
        getAdminStats(),
        getNewsPosts({ limit: 5 }),
        getAchievements({ limit: 5 }),
      ]);
      setStats(s);
      setRecentNews(n);
      setRecentAchievements(a);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />

      <main className="lg:pl-64 pt-16">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tighter text-primary mb-1">Executive Insights</h1>
              <p className="text-on-surface-variant font-body text-sm">Welcome back, Administrator. Here's your platform overview.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/news/new"
                className="bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                Publish News
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[1,2,3,4].map(i => <div key={i} className="h-48 bg-surface-container-low rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="Total Students" value={stats.totalStudents.toLocaleString()} icon="school" span={1} />
              <StatCard label="Achievements" value={stats.totalAchievements.toLocaleString()} icon="workspace_premium" />
              <StatCard label="Publications" value={stats.totalNews.toLocaleString()} icon="auto_stories" />
              <div className="bg-primary text-on-primary p-8 rounded-3xl h-[200px] flex flex-col justify-between shadow-xl">
                <span className="label-md uppercase tracking-widest text-[10px] font-bold text-on-primary-container">Platform Status</span>
                <div>
                  <h3 className="text-xl font-bold leading-tight mb-2">Smart League</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                    <span className="text-sm font-medium opacity-80">All systems operational</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Publications */}
            <div className="lg:col-span-2 bg-surface-container-low rounded-3xl overflow-hidden">
              <div className="p-8 pb-4 flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-primary">Recent Publications</h3>
                <Link to="/admin/news" className="text-sm font-bold text-surface-tint hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="px-8 py-3 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Title</th>
                      <th className="px-4 py-3 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Status</th>
                      <th className="px-4 py-3 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Author</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentNews.length === 0 ? (
                      <tr><td colSpan={3} className="px-8 py-8 text-center text-on-surface-variant text-sm">No publications yet.</td></tr>
                    ) : recentNews.map(n => (
                      <tr key={n.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                        <td className="px-8 py-4">
                          <p className="font-semibold text-on-surface text-sm line-clamp-1">{n.title}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide ${n.status === 'published' ? 'bg-secondary-container text-on-secondary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {n.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{n.authorName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-surface-container-low rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-primary">Recent Achievements</h3>
                <Link to="/admin/achievements" className="text-sm font-bold text-surface-tint hover:underline">All</Link>
              </div>
              <div className="flex flex-col gap-4">
                {recentAchievements.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-6">No achievements yet.</p>
                ) : recentAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface line-clamp-1">{a.title}</p>
                      <p className="text-xs text-on-surface-variant">{a.studentName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
