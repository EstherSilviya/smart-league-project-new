import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEvents } from '../../firebase/firestore';

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-24">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-outline-variant/20">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="text-xl font-extrabold text-primary tracking-tight font-headline">Events</h1>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-primary tracking-tighter">Upcoming Events</h2>
          <p className="text-on-surface-variant text-sm mt-2">Discover and participate in inter-college events and competitions.</p>
        </div>

        {/* Basic Teammate Placeholder UI */}
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-surface-container rounded-[2rem]"></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white p-8 rounded-[2rem] border border-outline-variant/20 text-center text-on-surface-variant">
              No upcoming events found. Check back later!
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-primary">{event.title}</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-3 py-1 rounded-full">{event.institution}</span>
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-2">{event.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-medium bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">
                    📅 {event.date}
                  </span>
                  <span className="text-xs font-medium bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">
                    🎓 {event.criteria}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-highest/80 backdrop-blur-xl z-50 rounded-t-3xl border-t border-outline-variant/30">
        <Link to="/feed" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Home</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Explore</span>
        </Link>
        <Link to="/events" className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-5 py-2 scale-110 active:scale-90 duration-200 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Events</span>
        </Link>
        <Link to="/notifications" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Activity</span>
        </Link>
      </nav>
    </div>
  );
};
