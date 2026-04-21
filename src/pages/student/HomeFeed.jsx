import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listenToNewsFeed, listenToAchievements } from '../../firebase/firestore';

export const HomeFeed = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loadedA = false;
    let loadedN = false;
    
    // Listen to achievements (limit 10 for feed)
    const unsubA = listenToAchievements((data) => {
      setAchievements(data);
      loadedA = true;
      if (loadedA && loadedN) setLoading(false);
    });

    // Listen to published news
    const unsubN = listenToNewsFeed((data) => {
      setNews(data);
      loadedN = true;
      if (loadedA && loadedN) setLoading(false);
    });
    
    // Fallback loading state clear
    const timer = setTimeout(() => setLoading(false), 3000);
    
    return () => { unsubA(); unsubN(); clearTimeout(timer); };
  }, []);

  // Combine and sort by date
  const feedItems = [...news, ...achievements].sort((a, b) => {
    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
    return tB - tA;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-bold animate-pulse">Synchronizing Feed...</p>
      </div>
    );
  }

  // Segment items for the bento grid
  const heroItem = feedItems[0];
  const majorItem = feedItems[1];
  const smallItem = feedItems[2];
  const medItem1 = feedItems[3];
  const remainingItems = feedItems.slice(4);

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body selection:bg-primary-container selection:text-on-primary-container">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* TopAppBar */}
      <nav className="bg-surface-container/80 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <img 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10" 
            src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.displayName || 'U')}&background=random`} 
          />
          <span className="text-xl font-bold text-primary tracking-tight font-headline">Smart League</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        {/* Trending Achievement Hero */}
        {heroItem ? (
          <section 
            onClick={() => navigate(`/achievement/${heroItem.postSlug || heroItem.id}`)}
            className="relative w-full rounded-[2rem] overflow-hidden bg-primary aspect-[21/9] md:aspect-[21/7] cursor-pointer group shadow-2xl shadow-primary/10"
          >
            {heroItem.imageUrl || heroItem.imageURL ? (
              <img 
                alt={heroItem.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" 
                src={heroItem.imageUrl || heroItem.imageURL} 
              />
            ) : (
              <div className="absolute inset-0 bg-primary-container opacity-20"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl space-y-4">
              <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-sm text-xs font-bold uppercase tracking-wider font-inter w-fit">
                Trending: {heroItem.category || 'Global Excellence'}
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-tight font-headline">
                {heroItem.title}
              </h1>
              <p className="text-primary-fixed body-lg opacity-90 max-w-lg line-clamp-2">
                {heroItem.description}
              </p>
              <div className="pt-4">
                <button className="bg-primary-fixed text-on-primary-fixed px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95">
                  Read Excellence Report
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="h-64 bg-surface-container rounded-[2rem] flex items-center justify-center border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-bold">
            No trending achievements yet.
          </div>
        )}

        {/* Filters Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider font-inter text-outline">Curated Discovery</span>
            <h2 className="text-3xl font-bold text-primary font-headline">Achievement Feed</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-low rounded-full text-on-surface-variant font-medium text-sm hover:bg-surface-container transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">location_on</span>
              Global Region
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-low rounded-full text-on-surface-variant font-medium text-sm hover:bg-surface-container transition-all border border-outline-variant/10">
              <span className="material-symbols-outlined text-lg">account_balance</span>
              Institutions
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </section>

        {/* Achievement Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Major Card */}
          {majorItem && (
            <div 
              onClick={() => navigate(`/achievement/${majorItem.postSlug || majorItem.id}`)}
              className="md:col-span-8 bg-surface-container-low rounded-[2rem] overflow-hidden group border border-transparent hover:border-outline-variant/20 transition-all duration-300 cursor-pointer shadow-sm"
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                  <img 
                    alt={majorItem.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    src={majorItem.imageUrl || majorItem.imageURL || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80'} 
                  />
                  <div className="absolute top-4 left-4 bg-tertiary-container text-white px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                    {majorItem.category}
                  </div>
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-container-highest rounded-full flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    </div>
                    <span className="text-sm font-semibold text-outline">{majorItem.institution}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary leading-tight font-headline">{majorItem.title}</h3>
                  <p className="text-on-surface-variant body-md leading-relaxed line-clamp-3">{majorItem.description}</p>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-container border-2 border-surface flex items-center justify-center text-[10px] text-on-primary-container font-bold">
                        {(majorItem.studentName || 'S')[0]}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-surface flex items-center justify-center text-[10px] text-on-secondary-container font-bold">
                        {(majorItem.institution || 'I')[0]}
                      </div>
                    </div>
                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      View Story <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Small Card */}
          {smallItem && (
            <div 
              onClick={() => navigate(`/achievement/${smallItem.postSlug || smallItem.id}`)}
              className="md:col-span-4 bg-surface-container rounded-[2rem] p-8 flex flex-col space-y-6 cursor-pointer hover:bg-surface-container-high transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                  {smallItem.category}
                </span>
                <span className="material-symbols-outlined text-outline">more_horiz</span>
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold text-primary font-headline line-clamp-2">{smallItem.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-4">{smallItem.description}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
                    {(smallItem.studentName || 'S')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary leading-none">{smallItem.studentName}</p>
                    <p className="text-[11px] text-outline font-medium">{smallItem.institution}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medium Card 1 */}
          {medItem1 && (
            <div 
              onClick={() => navigate(`/achievement/${medItem1.postSlug || medItem1.id}`)}
              className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 cursor-pointer hover:bg-surface-container transition-colors shadow-sm"
            >
              <div className="md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-surface-container">
                <img 
                  alt={medItem1.title} 
                  className="w-full h-full object-cover" 
                  src={medItem1.imageUrl || medItem1.imageURL || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80'} 
                />
              </div>
              <div className="md:w-2/3 space-y-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-label">
                  {medItem1.category}
                </span>
                <h3 className="text-xl font-bold text-primary font-headline line-clamp-2">{medItem1.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">{medItem1.description}</p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Performance Highlight</span>
                </div>
              </div>
            </div>
          )}

          {/* Impact/CTA Card */}
          <div className="md:col-span-6 bg-primary text-white rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-center shadow-xl shadow-primary/20">
            <div className="relative z-10 space-y-4">
              <span className="material-symbols-outlined text-secondary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              <h3 className="text-2xl font-extrabold font-headline">Smart League Community Impact</h3>
              <p className="text-primary-fixed opacity-80 body-md">Students from 42 countries have contributed over 10,000 hours to humanitarian research this semester.</p>
              <div className="pt-4">
                <button className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg">Join the Initiative</button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container rounded-full blur-3xl opacity-20"></div>
          </div>
        </section>

        {/* ── Remaining Items Grid ── */}
        {remainingItems.length > 0 && (
          <section className="space-y-8 pb-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-primary font-headline">More Achievements</h2>
              <div className="h-px flex-grow bg-outline-variant/20"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingItems.map((item, idx) => (
                <div 
                  key={item.id}
                  onClick={() => navigate(`/achievement/${item.postSlug || item.id}`)}
                  className="bg-white rounded-3xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-surface-container">
                    <img 
                      src={item.imageUrl || item.imageURL || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80'} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className="font-bold text-primary line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/5">
                      <span className="text-xs font-medium text-outline">{item.studentName}</span>
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Live Story</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {feedItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-outline-variant text-4xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary font-headline">No stories found</h3>
              <p className="text-on-surface-variant max-w-xs mx-auto">New achievements and news will appear here as soon as they are approved by the administration.</p>
            </div>
          </div>
        )}
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container-highest/80 backdrop-blur-xl z-50 rounded-t-3xl border-t border-outline-variant/30 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <Link 
          to="/feed" 
          className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-5 py-2 scale-110 active:scale-90 duration-200 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Home</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Explore</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">school</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Portfolio</span>
        </Link>
        <Link to="/notifications" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Activity</span>
        </Link>
      </nav>
    </div>
  );
};
