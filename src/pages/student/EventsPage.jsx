import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEvents, listenToNewsFeed } from '../../firebase/firestore';

// ─── localStorage helpers (shared with ActivityPage) ─────────────────────────
const SEEN_KEY = 'smartleague_seen_news';
const getSeenIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
  catch { return new Set(); }
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = listenToNewsFeed((news) => {
      const seen = getSeenIds();
      setUnreadCount(news.filter((n) => !seen.has(n.id)).length);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const cardAccents = [
    { from: '#0f2951', via: '#1a3a6e', badge: '#F59E0B', icon: 'palette' },
    { from: '#0d3d2e', via: '#155d42', badge: '#34D399', icon: 'computer' },
    { from: '#3b1a5e', via: '#5b2d8c', badge: '#A78BFA', icon: 'music_note' },
    { from: '#7c1d1d', via: '#b91c1c', badge: '#FCA5A5', icon: 'sports_basketball' },
    { from: '#1e3a5f', via: '#1d4ed8', badge: '#60A5FA', icon: 'science' },
  ];

  const getAccent = (idx) => cardAccents[idx % cardAccents.length];

  return (
    <div
      style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}
      className="bg-[#f0f2f8] min-h-screen pb-32 text-[#0f172a]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .card-lift { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(15,41,81,0.14); }
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
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .slide-up { animation: slideUp 0.5s ease both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stagger-1 { animation-delay: 0.05s; }
        .stagger-2 { animation-delay: 0.12s; }
        .stagger-3 { animation-delay: 0.19s; }
        .stagger-4 { animation-delay: 0.26s; }
        .stagger-5 { animation-delay: 0.33s; }
        .shimmer {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .badge-pop { animation: badgePop 0.3s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes badgePop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── TOP NAV ── */}
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
                Events
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 glow-dot">Live &amp; Upcoming</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-[#0f2951]">tune</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="pt-20 w-full max-w-4xl mx-auto px-6">

        {/* ── HERO BANNER ── */}
        <div
          className="slide-up mt-5 rounded-[2rem] overflow-hidden relative w-full"
          style={{
            background: 'linear-gradient(135deg, #0f2951 0%, #1a3a6e 55%, #0d3d2e 100%)',
            minHeight: '200px',
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
          />
          <div
            className="absolute -bottom-6 -left-6 w-44 h-44 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #34D399, transparent)' }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 30px,#fff 30px,#fff 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#fff 30px,#fff 31px)',
            }}
          />

          <div className="relative z-10 p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-3">
                  <span className="material-symbols-outlined text-[13px]">event</span>
                  Season 2026
                </span>
                <h2
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, lineHeight: 1.1 }}
                  className="text-[32px] text-white"
                >
                  Upcoming<br />
                  <span style={{ color: '#F59E0B' }}>Events</span>
                </h2>
                <p className="text-white/50 text-[13px] mt-2 leading-relaxed max-w-[320px]">
                  Discover inter-college events, competitions &amp; workshops.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <span
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#F59E0B' }}
                  className="text-4xl leading-none"
                >
                  {loading ? '–' : events.length}
                </span>
                <span className="text-white/50 text-[11px] mt-1 font-medium">Events</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 flex-wrap">
              {[
                { icon: 'location_on', label: 'Multiple Venues' },
                { icon: 'school', label: 'All Levels' },
                { icon: 'trophy', label: 'Prizes & Certs' },
              ].map((s) => (
                <span
                  key={s.label}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/70 text-[12px] font-medium"
                >
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {s.icon}
                  </span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <div className="flex items-center justify-between mt-8 mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Curated for You</p>
            <h3
              style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
              className="text-[20px] text-[#0f2951] mt-0.5"
            >
              All Events
            </h3>
          </div>
        </div>

        {/* ── EVENTS LIST ── */}
        <div className="space-y-5 pb-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-[1.75rem] overflow-hidden">
                <div className="h-32 shimmer rounded-[1.75rem]" />
                <div className="bg-white p-6 rounded-b-[1.75rem] space-y-3">
                  <div className="h-4 shimmer rounded-full w-3/4" />
                  <div className="h-3 shimmer rounded-full w-full" />
                  <div className="h-3 shimmer rounded-full w-2/3" />
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center slide-up">
              <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-5xl text-slate-300">event_busy</span>
              </div>
              <h4
                style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
                className="text-[18px] text-[#0f2951]"
              >
                No Events Yet
              </h4>
              <p className="text-slate-400 text-[14px] mt-1.5 max-w-[280px]">
                New events will appear here — check back soon!
              </p>
            </div>
          ) : (
            events.map((event, idx) => {
              const accent = getAccent(idx);
              const stagger = `stagger-${Math.min(idx + 1, 5)}`;
              return (
                <div
                  key={event.id}
                  className={`card-lift slide-up ${stagger} rounded-[1.75rem] overflow-hidden bg-white shadow-md border border-slate-100/80`}
                >
                  {/* ── Coloured top strip ── */}
                  <div
                    className="relative h-[130px] flex items-end px-7 pb-5"
                    style={{
                      background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.via} 100%)`,
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-20"
                      style={{
                        background: `radial-gradient(circle, ${accent.badge}, transparent)`,
                        transform: 'translate(30%, -30%)',
                      }}
                    />

                    <div className="absolute top-4 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                      <span
                        className="material-symbols-outlined text-white text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {accent.icon}
                      </span>
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">
                        {event.institution}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                      <span
                        className="material-symbols-outlined text-white/80 text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        calendar_month
                      </span>
                      <span className="text-white text-[12px] font-semibold">{event.date}</span>
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="p-6 pt-5">
                    <h3
                      style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700 }}
                      className="text-[16px] text-[#0f2951] leading-snug"
                    >
                      {event.title}
                    </h3>

                    <p className="text-slate-500 text-[13px] leading-relaxed mt-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100">
                      <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                        style={{ background: accent.badge + '18', color: accent.from }}
                      >
                        <span
                          className="material-symbols-outlined text-[13px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          school
                        </span>
                        {event.criteria}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 left-0 w-full z-50 px-6 pb-6 pt-3"
        style={{
          background: 'linear-gradient(to top, rgba(240,242,248,0.98) 70%, transparent)',
        }}
      >
        <div className="w-full max-w-4xl mx-auto flex justify-around items-center bg-white rounded-[2rem] px-4 py-2 shadow-[0_8px_32px_rgba(15,41,81,0.12)] border border-slate-100">
          <Link
            to="/explore"
            className="flex flex-col items-center justify-center px-6 py-2 text-slate-400 hover:text-[#0f2951] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="text-[10px] font-semibold mt-0.5">Explore</span>
          </Link>

          <Link
            to="/events"
            className="flex flex-col items-center justify-center px-6 py-2.5 rounded-[1.25rem] text-white active:scale-90 duration-200 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0f2951, #1a3a6e)' }}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              event
            </span>
            <span className="text-[10px] font-bold mt-0.5">Events</span>
          </Link>

          <Link
            to="/activity"
            className="relative flex flex-col items-center justify-center px-6 py-2 text-slate-400 hover:text-[#0f2951] transition-colors"
          >
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none badge-pop"
                style={{ boxShadow: '0 0 0 2px white' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="text-[10px] font-semibold mt-0.5">Activity</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};