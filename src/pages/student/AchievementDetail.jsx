import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getNewsPostById, getAchievementById, getNewsPosts, getNewsPostBySlug } from '../../firebase/firestore';

export const AchievementDetail = () => {
  const { postId } = useParams(); // This could be ID or Slug
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Try to load as news by SLUG first
      let data = await getNewsPostBySlug(postId);
      
      // 2. If not found, try by ID
      if (!data) {
        data = await getNewsPostById(postId);
      }
      
      // 3. Fallback to legacy achievement collection
      if (!data) {
        data = await getAchievementById(postId);
      }
      
      if (data) {
        setPost(data);
        // Fetch related posts in the same category
        const relatedData = await getNewsPosts({ status: 'published', category: data.category });
        setRelated(relatedData.filter(r => r.id !== data.id).slice(0, 3));
      }
      setLoading(false);
    };
    loadData();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-bold animate-pulse font-headline">Transcribing Story...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-6">
        <span className="material-symbols-outlined text-6xl text-outline mb-4">article_off</span>
        <h1 className="text-2xl font-headline font-extrabold text-primary mb-2">Achievement Not Found</h1>
        <p className="text-on-surface-variant mb-6">The story you're looking for might have been archived or is still pending approval.</p>
        <Link to="/feed" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold">Back to Feed</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary-container min-h-screen antialiased">
      {/* TopAppBar */}
      <nav className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/10 flex justify-between items-center px-6 py-4 w-full">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200/50 transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="text-xl font-extrabold text-primary tracking-tight font-headline">Smart League Atelier</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-primary hover:bg-surface-container-high rounded-full p-2 transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pb-32">
        {/* Hero Banner Section */}
        <header className="relative w-full h-[450px] md:h-[550px] overflow-hidden bg-primary shadow-2xl">
          {post.imageURL ? (
            <img 
              src={post.imageURL} 
              alt={post.title} 
              className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000" 
            />
          ) : (
            <div className="w-full h-full bg-primary-container opacity-40"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-tertiary-container text-on-tertiary-container text-[10px] font-black tracking-[0.2em] uppercase rounded-sm font-label shadow-xl">
                {post.category}
              </span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-sm font-label">
                {post.createdAt?.toDate?.() ? post.createdAt.toDate().getFullYear() : '2024'} Season
              </span>
            </div>
            <h2 className="text-white text-4xl md:text-7xl font-extrabold font-headline leading-tight tracking-tight max-w-4xl drop-shadow-2xl">
              {post.title}
            </h2>
          </div>
        </header>

        <div className="px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
          {/* Article Content */}
          <article className="lg:col-span-8 space-y-12">
            <div className="flex items-center gap-6 pb-10 border-b border-outline-variant/10">
              <button className="flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-full font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span>Congratulate</span>
              </button>
              <button 
                onClick={() => { if (navigator.share) navigator.share({ title: post.title, url: window.location.href }); }} 
                className="flex items-center gap-3 px-8 py-4 bg-surface-container-low text-on-surface rounded-full font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined">share</span>
                <span>Share Story</span>
              </button>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-2xl text-primary font-headline font-bold leading-relaxed mb-10 border-l-4 border-secondary pl-8">
                {post.description?.split('.')[0]}.
              </p>
              
              <div className="space-y-8 text-on-surface leading-loose text-lg whitespace-pre-line font-medium opacity-90">
                {post.description}
                
                {!post.description && (
                  <p className="italic text-outline">The full narrative for this achievement is currently being finalized by our editorial team.</p>
                )}
              </div>
            </div>

            {/* Related Achievements */}
            {related.length > 0 && (
              <section className="pt-16 border-t border-outline-variant/10 mt-16">
                <h3 className="text-3xl font-headline font-extrabold text-primary mb-10 tracking-tight">Related Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {related.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => { navigate(`/achievement/${r.postSlug || r.id}`); window.scrollTo(0,0); }}
                      className="group cursor-pointer bg-surface-container-low rounded-3xl overflow-hidden transition-all hover:shadow-xl border border-outline-variant/10"
                    >
                      <div className="aspect-video overflow-hidden">
                        {r.imageURL ? (
                          <img src={r.imageURL} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-primary/5 flex items-center justify-center"><span className="material-symbols-outlined text-primary/10 text-4xl">school</span></div>
                        )}
                      </div>
                      <div className="p-8">
                        <span className="text-[10px] font-black uppercase text-secondary tracking-[0.2em]">{r.category}</span>
                        <h4 className="font-headline font-bold text-xl leading-tight mt-3 text-primary group-hover:text-primary-container transition-colors line-clamp-2">{r.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar: Student Spotlight */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <div className="bg-surface-container-highest rounded-[3rem] p-10 space-y-10 shadow-sm border border-outline-variant/10">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-10 font-label">Student of the Moment</h3>
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-secondary to-tertiary shadow-xl group-hover:scale-105 transition-transform duration-500">
                      <div className="w-full h-full rounded-full bg-surface border-4 border-surface-container-highest flex items-center justify-center text-4xl font-black text-primary uppercase shadow-inner">
                         {post.studentName?.[0] || 'S'}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-outline-variant/10">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  </div>
                  <h4 className="text-3xl font-extrabold font-headline text-primary mt-8 mb-2 leading-none">{post.studentName}</h4>
                  <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest mb-10 opacity-60">Elite League Fellow</p>
                  
                  <div className="w-full space-y-4 text-left">
                    <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-outline-variant/10">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xl">school</span>
                      </div>
                      <div className="text-sm">
                        <p className="text-[10px] font-black text-outline uppercase tracking-widest">Institution</p>
                        <p className="font-bold text-primary truncate max-w-[180px]">{post.institution}</p>
                      </div>
                    </div>
                    {post.location && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-outline-variant/10">
                        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                        </div>
                        <div className="text-sm">
                          <p className="text-[10px] font-black text-outline uppercase tracking-widest">Origin</p>
                          <p className="font-bold text-primary uppercase tracking-tighter">{post.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/profile/${post.studentSlug}`)}
                    className="w-full mt-10 py-5 bg-secondary-container text-on-secondary-container rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/10 hover:scale-[1.03] transition-all"
                  >
                    View Adrians Portfolio
                  </button>
                </div>
              </div>

              {/* Quick Navigation Footer */}
              <div className="p-8 text-center bg-primary/5 rounded-[2.5rem] border border-primary/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Smart League Global Access</p>
                <div className="flex justify-center gap-4 mt-4">
                  <Link to="/feed" className="text-xs font-bold text-primary hover:underline">Feed</Link>
                  <Link to="/explore" className="text-xs font-bold text-primary hover:underline">Explore</Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
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
        <div className="flex items-center justify-center bg-primary text-white rounded-full w-14 h-14 shadow-xl shadow-primary/20 scale-110">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        </div>
        <Link to={`/profile/${post.studentSlug}`} className="flex flex-col items-center justify-center text-slate-400 px-4 py-2">
          <span className="material-symbols-outlined">school</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Profile</span>
        </Link>
        <Link to="/notifications" className="flex flex-col items-center justify-center text-slate-400 px-4 py-2">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Activity</span>
        </Link>
      </nav>
    </div>
  );
};
