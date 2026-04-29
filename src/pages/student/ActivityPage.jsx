import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listenToNewsFeed } from '../../firebase/firestore';

// ─── localStorage helpers ───────────────────────────────────────────────────
const SEEN_KEY = 'smartleague_seen_news';

const getSeenIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const saveSeenIds = (ids) => {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
};

// ─── Time formatter ──────────────────────────────────────────────────────────
const timeAgo = (ts) => {
  if (!ts) return '';
  const ms = ts?.toMillis ? ts.toMillis() : ts?.seconds ? ts.seconds * 1000 : new Date(ts).getTime();
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ─── Category icon map ───────────────────────────────────────────────────────
const categoryIcon = (cat = '') => {
  const c = cat.toLowerCase();
  if (c.includes('tech') || c.includes('computer')) return { icon: 'computer', color: '#0d3d2e', bg: '#34D39920', accent: '#34D399' };
  if (c.includes('art') || c.includes('cult')) return { icon: 'palette', color: '#0f2951', bg: '#F59E0B20', accent: '#F59E0B' };
  if (c.includes('sport')) return { icon: 'sports_basketball', color: '#7c1d1d', bg: '#FCA5A520', accent: '#FCA5A5' };
  if (c.includes('music')) return { icon: 'music_note', color: '#3b1a5e', bg: '#A78BFA20', accent: '#A78BFA' };
  if (c.includes('sci')) return { icon: 'science', color: '#1e3a5f', bg: '#60A5FA20', accent: '#60A5FA' };
  if (c.includes('event')) return { icon: 'event', color: '#065f46', bg: '#6EE7B720', accent: '#6EE7B7' };
  return { icon: 'campaign', color: '#0f2951', bg: '#6366F120', accent: '#6366F1' };
};

export const ActivityPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seenIds, setSeenIds] = useState(getSeenIds);
  const pageOpenedAt = useRef(Date.now());
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    const unsub = listenToNewsFeed((data) => {
      setNews(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    return () => {
      if (!hasMarkedRef.current && news.length > 0) {
        const updated = new Set([...getSeenIds(), ...news.map((n) => n.id)]);
        saveSeenIds(updated);
        hasMarkedRef.current = true;
      }
    };
  }, [news]);

  useEffect(() => {
    if (news.length === 0) return;
    const t = setTimeout(() => {
      const updated = new Set([...getSeenIds(), ...news.map((n) => n.id)]);
      saveSeenIds(updated);
      setSeenIds(updated);
      hasMarkedRef.current = true;
    }, 1200);
    return () => clearTimeout(t);
  }, [news]);

  const newItems = news.filter((n) => !seenIds.has(n.id));
  const oldItems = news.filter((n) => seenIds.has(n.id));

  return (
    <div
      style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}
      className="bg-[#f0f2f8] min-h-screen pb-32 text-[#0f172a]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .slide-up { animation: slideUp 0.45s ease both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stagger-1{animation-delay:0.04s} .stagger-2{animation-delay:0.09s}
        .stagger-3{animation-delay:0.14s} .stagger-4{animation-delay:0.19s}
        .stagger-5{animation-delay:0.24s}
        .shimmer {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .notif-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .notif-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(15,41,81,0.1); }
        .new-badge-pulse { animation: newPulse 2s ease-in-out infinite; }
        @keyframes newPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        .glow-dot::before {
          content: '';
          display: inline-block;
          width: 7px; height: 7px;
          background: #22C55E;
          border-radius: 50%;
          margin-right: 5px;
          animation: pulse-dot 1.6s ease-in-out infinite;
          vertical-align: middle;
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
      `}</style>

      {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] text-[#0f2951]">arrow_back</span>
            </button>
            <div>
              <h1
                style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}
                className="text-[18px] text-[#0f2951] tracking-tight leading-none"
              >
                Activity
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 glow-dot">Live Updates</p>
            </div>
          </div>
          {newItems.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-500 new-badge-pulse" />
              <span className="text-[11px] font-bold text-red-600">{newItems.length} new</span>
            </div>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="pt-20 w-full max-w-4xl mx-auto px-6">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <div
          className="slide-up mt-5 rounded-[2rem] overflow-hidden relative w-full"
          style={{
            background: 'linear-gradient(135deg, #0f2951 0%, #1a3a6e 55%, #0d3d2e 100%)',
            minHeight: '175px',
          }}
        >
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
          <div className="absolute -bottom-6 -left-6 w-44 h-44 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, #34D399, transparent)' }} />
          <div className="absolute inset-0 opacity-5"
               style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,#fff 28px,#fff 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,#fff 28px,#fff 29px)' }} />

          <div className="relative z-10 p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-3">
                  <span className="material-symbols-outlined text-[13px]">notifications_active</span>
                  Activity Feed
                </span>
                <h2
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, lineHeight: 1.1 }}
                  className="text-[30px] text-white"
                >
                  What's <span style={{ color: '#F59E0B' }}>New</span>
                </h2>
                <p className="text-white/50 text-[13px] mt-2 leading-relaxed max-w-[320px]">
                  All published news and updates from your institution appear here.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#F59E0B' }}
                      className="text-4xl leading-none">
                  {loading ? '–' : news.length}
                </span>
                <span className="text-white/50 text-[11px] mt-1 font-medium">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LOADING SKELETONS ─────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4 mt-7">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[1.5rem] p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 shimmer rounded-full w-3/4" />
                  <div className="h-3 shimmer rounded-full w-full" />
                  <div className="h-3 shimmer rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ───────────────────────────────────────────────── */}
        {!loading && news.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center slide-up mt-6">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-5xl text-slate-300">notifications_off</span>
            </div>
            <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
                className="text-[18px] text-[#0f2951]">No Activity Yet</h4>
            <p className="text-slate-400 text-[14px] mt-1.5 max-w-[280px]">
              When news gets published, it'll show up here as a notification.
            </p>
          </div>
        )}

        {/* ── NEW SECTION ───────────────────────────────────────────────── */}
        {!loading && newItems.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 new-badge-pulse" />
              <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">New — {newItems.length} unread</p>
            </div>
            <div className="space-y-4">
              {newItems.map((item, idx) => {
                const cat = categoryIcon(item.category);
                const stagger = `stagger-${Math.min(idx + 1, 5)}`;
                return (
                  <div
                    key={item.id}
                    className={`notif-card slide-up ${stagger} bg-white rounded-[1.5rem] border-2 border-red-100 shadow-sm overflow-hidden relative cursor-pointer`}
                    style={{ boxShadow: '0 0 0 2px rgba(239,68,68,0.08), 0 4px 16px rgba(15,41,81,0.07)' }}
                    onClick={() => navigate(`/news/${item.id}`)}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[1.5rem]"
                         style={{ background: 'linear-gradient(to bottom, #ef4444, #f97316)' }} />

                    <div className="flex items-start gap-4 p-5 pl-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                           style={{ background: cat.bg }}>
                        <span className="material-symbols-outlined text-[24px]"
                              style={{ color: cat.color, fontVariationSettings: "'FILL' 1" }}>
                          {cat.icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">fiber_new</span>
                            New
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{timeAgo(item.createdAt)}</span>
                        </div>

                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
                            className="text-[15px] text-[#0f2951] leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-slate-500 text-[12.5px] leading-relaxed mt-1.5 line-clamp-2">
                          {item.summary || item.content?.replace(/<[^>]+>/g, '').slice(0, 120)}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: cat.bg, color: cat.color }}>
                            {item.institution || 'Institution'}
                          </span>
                          <span className="text-[11px] font-semibold text-[#0f2951] flex items-center gap-0.5">
                            Read more
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EARLIER SECTION ───────────────────────────────────────────── */}
        {!loading && oldItems.length > 0 && (
          <div className={newItems.length > 0 ? 'mt-8' : 'mt-7'}>
            {newItems.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Earlier</p>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            )}
            {newItems.length === 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">All Updates</p>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
                    className="text-[20px] text-[#0f2951] mt-0.5">Published News</h3>
              </div>
            )}
            <div className="space-y-4">
              {oldItems.map((item, idx) => {
                const cat = categoryIcon(item.category);
                const stagger = `stagger-${Math.min(idx + 1, 5)}`;
                return (
                  <div
                    key={item.id}
                    className={`notif-card slide-up ${stagger} bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden relative cursor-pointer`}
                    onClick={() => navigate(`/news/${item.id}`)}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[1.5rem]"
                         style={{ background: cat.accent }} />

                    <div className="flex items-start gap-4 p-5 pl-6">
                      <div className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0"
                           style={{ background: cat.bg, width: '52px', height: '52px' }}>
                        <span className="material-symbols-outlined text-[22px]"
                              style={{ color: cat.color, fontVariationSettings: "'FILL' 1" }}>
                          {cat.icon}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                                style={{ background: cat.bg, color: cat.color }}>
                            {item.institution || 'Institution'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">{timeAgo(item.createdAt)}</span>
                        </div>

                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
                            className="text-[14px] text-[#0f2951] leading-snug mt-1">
                          {item.title}
                        </h3>

                        <p className="text-slate-400 text-[12px] leading-relaxed mt-1 line-clamp-2">
                          {item.summary || item.content?.replace(/<[^>]+>/g, '').slice(0, 120)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-6" />
      </main>

      {/* ── BOTTOM NAV ───────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 w-full z-50 px-6 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, rgba(240,242,248,0.98) 70%, transparent)' }}
      >
        <div className="w-full max-w-4xl mx-auto flex justify-around items-center bg-white rounded-[2rem] px-4 py-2 shadow-[0_8px_32px_rgba(15,41,81,0.12)] border border-slate-100">
          <Link to="/explore"
                className="flex flex-col items-center justify-center px-6 py-2 text-slate-400 hover:text-[#0f2951] transition-colors">
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="text-[10px] font-semibold mt-0.5">Explore</span>
          </Link>

          <Link to="/events"
                className="flex flex-col items-center justify-center px-6 py-2 text-slate-400 hover:text-[#0f2951] transition-colors">
            <span className="material-symbols-outlined text-[22px]">event</span>
            <span className="text-[10px] font-semibold mt-0.5">Events</span>
          </Link>

          <Link to="/activity"
                className="flex flex-col items-center justify-center px-6 py-2.5 rounded-[1.25rem] text-white active:scale-90 duration-200 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0f2951, #1a3a6e)' }}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            <span className="text-[10px] font-bold mt-0.5">Activity</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};