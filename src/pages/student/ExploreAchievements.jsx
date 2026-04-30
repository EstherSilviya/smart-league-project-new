import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listenToNewsFeed, listenToAchievements } from "../../firebase/firestore";
 
// ── localStorage helper (shared with ActivityPage / EventsPage) ──────────────
const getSeenIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem('smartleague_seen_news') || '[]')); }
  catch { return new Set(); }
};
 
export const ExploreAchievements = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
 
  // ── HomeFeed state (logic unchanged) ──
  const [achievements, setAchievements] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
 
  // ── Unread badge count for Activity tab ──────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Achievements tab state ──
  const [achieverTab, setAchieverTab] = useState("global");

  // ── Search state ─────────────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
 
  useEffect(() => {
    let loadedA = false;
    let loadedN = false;

    // achievements collection has no public Firestore rule — only fetch if logged in
    if (currentUser) {
      const unsubA = listenToAchievements((data) => {
        setAchievements(data);
        loadedA = true;
        if (loadedA && loadedN) setLoading(false);
      });

      const unsubN = listenToNewsFeed((data) => {
        setNews(data);
        loadedN = true;
        if (loadedA && loadedN) setLoading(false);
      });

      const timer = setTimeout(() => setLoading(false), 3000);
      return () => { unsubA(); unsubN(); clearTimeout(timer); };
    } else {
      // Public users: only fetch published news (no achievements — no permission)
      const unsubN = listenToNewsFeed((data) => {
        setNews(data);
        setLoading(false);
      });
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => { unsubN(); clearTimeout(timer); };
    }
  }, [currentUser]);
 
  // ── Listen separately just for unread badge count ────────────────────────
  useEffect(() => {
    const unsub = listenToNewsFeed((newsData) => {
      const seen = getSeenIds();
      setUnreadCount(newsData.filter((n) => !seen.has(n.id)).length);
    });
    return () => unsub();
  }, []);
 
  // Combine and sort by date (logic unchanged)
  const feedItems = [...news, ...achievements].sort((a, b) => {
    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
    return tB - tA;
  });

  // ── India location keywords for Local/Global filtering ──────────────────────
  const INDIA_KEYWORDS = [
    'india', 'indian',
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
    'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
    'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
    'andaman', 'nicobar', 'chandigarh', 'dadra', 'daman', 'diu', 'jammu',
    'kashmir', 'ladakh', 'lakshadweep', 'puducherry', 'pondicherry',
    'delhi', 'mumbai', 'chennai', 'kolkata', 'bangalore', 'bengaluru',
    'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow',
    'kanpur', 'nagpur', 'madurai', 'coimbatore', 'kochi', 'thiruvananthapuram',
    'vizag', 'visakhapatnam', 'bhopal', 'indore', 'patna', 'vadodara',
    'agra', 'nashik', 'meerut', 'faridabad', 'ghaziabad', 'rajkot',
    'ludhiana', 'amritsar', 'varanasi', 'aurangabad', 'solapur', 'ranchi',
    'raipur', 'jabalpur', 'guwahati', 'trichy', 'tiruchirappalli', 'salem',
    'tirunelveli', 'erode', 'vellore', 'tiruppur', 'thoothukudi', 'nagercoil',
    'dindigul', 'thanjavur', 'kumbakonam', 'karur', 'sivakasi', 'hosur',
    'kanyakumari', 'cuddalore', 'villupuram', 'tenkasi', 'virudhunagar',
    'krishnagiri', 'dharmapuri', 'theni', 'namakkal', 'ooty', 'nilgiris',
    'perambalur', 'ariyalur', 'chengalpattu', 'ranipet', 'tirupattur',
    'tiruvannamalai', 'kallakurichi',
  ];

  const isIndiaLocation = (location) => {
    if (!location) return false;
    const loc = location.toLowerCase();
    return INDIA_KEYWORDS.some((kw) => loc.includes(kw));
  };

  // ── Derive real achievers from Firebase feed data ────────────────────────────
  const buildAchieverList = (items) => {
    const studentMap = {};
    items.forEach((item) => {
      const students = Array.isArray(item.studentsData) && item.studentsData.length > 0
        ? item.studentsData
        : item.studentName ? [{ name: item.studentName, courseYear: '' }] : [];
      students.forEach((s) => {
        if (!s.name) return;
        const key = s.name.toLowerCase().trim();
        if (!studentMap[key]) {
          studentMap[key] = {
            name: s.name,
            courseYear: s.courseYear || '',
            location: item.location || '',
            category: item.category || 'Student',
            institution: item.institution || '',
            img: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&bold=true&size=128`,
            count: 0,
          };
        }
        studentMap[key].count += 1;
        if (item.category) studentMap[key].category = item.category;
      });
    });
    return Object.values(studentMap).sort((a, b) => b.count - a.count);
  };

  const allAchievers = buildAchieverList(feedItems);
  const localAchievers = allAchievers.filter((a) => isIndiaLocation(a.location));
  const globalAchievers = allAchievers.filter((a) => !isIndiaLocation(a.location) && a.location);
  const topAchievers = [...allAchievers].slice(0, 8);

  const MEDAL = ['🥇', '🥈', '🥉'];
  const formatAchiever = (a, idx) => ({
    rank: MEDAL[idx] || String(idx + 1).padStart(2, '0'),
    name: a.name,
    sub: [a.courseYear, a.institution].filter(Boolean).join(' • ') + ` • ${a.count} achievement${a.count !== 1 ? 's' : ''}`,
    tag: a.category,
    tagColor: 'bg-primary-container text-on-primary-container',
    img: a.img,
    location: a.location,
  });

  const currentAchievers =
    achieverTab === 'local' ? localAchievers.slice(0, 8).map(formatAchiever)
    : achieverTab === 'global' ? globalAchievers.slice(0, 8).map(formatAchiever)
    : topAchievers.slice(0, 8).map(formatAchiever);

  // ── Filtered feed — driven by search query + dropdowns (from real Firebase data) ──
  const filteredFeed = feedItems.filter(item => {
    // Text search: matches title, institution, student names, description, location
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const studentNames = [
        item.studentName || '',
        ...((item.studentsData || []).map(s => s.name || '')),
      ].join(' ').toLowerCase();
      const instName = (item.institution || item.authorInstitution || '').toLowerCase();
      const matches =
        item.title?.toLowerCase().includes(q) ||
        instName.includes(q) ||
        studentNames.includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    // Region dropdown filter
    if (regionFilter === 'local' && !isIndiaLocation(item.location)) return false;
    if (regionFilter === 'global' && isIndiaLocation(item.location)) return false;
    if (regionFilter === 'national' && !isIndiaLocation(item.location)) return false;
    // Institution type dropdown filter (keyword match on institution name)
    if (institutionFilter) {
      const inst = (item.institution || '').toLowerCase();
      if (institutionFilter === 'school' && !inst.includes('school') && !inst.includes('hr sec') && !inst.includes('higher secondary') && !inst.includes('matric') && !inst.includes('vidyalaya') && !inst.includes('vidya')) return false;
      if (institutionFilter === 'college' && !inst.includes('college') && !inst.includes('arts') && !inst.includes('science') && !inst.includes('polytechnic') && !inst.includes('engineering')) return false;
      if (institutionFilter === 'university' && !inst.includes('university') && !inst.includes('univ') && !inst.includes('deemed') && !inst.includes('institute of technology')) return false;
    }
    return true;
  });

  const displayItems = (searchQuery || regionFilter || institutionFilter) ? filteredFeed : feedItems;
  const heroItem = displayItems[0];
  const majorItem = displayItems[1];
  const smallItem = displayItems[2];
  const medItem1 = displayItems[3];
  const remainingItems = displayItems.slice(4);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-primary font-bold animate-pulse">Loading Explore...</p>
      </div>
    );
  }
 
  const categories = [
    { icon: "sports_basketball", label: "Sports", path: "/category/sports", color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" },
    { icon: "biotech", label: "Research", path: "/category/research", color: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" },
    { icon: "terminal", label: "Tech", path: "/category/tech", color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" },
    { icon: "palette", label: "Arts", path: "/category/arts", color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200" },
    { icon: "diversity_1", label: "Service", path: "/category/service", color: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200" },
    { icon: "school", label: "Academic Excellence", path: "/category/Academic Excellence", color: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200" },
    
  ];
 
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body selection:bg-primary-container selection:text-on-primary-container">
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .explore-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 38px !important;
        }
        .tab-active {
          background: var(--color-primary, #1d4ed8);
          color: white;
          box-shadow: 0 2px 12px rgba(29,78,216,0.25);
        }
        .tab-inactive {
          background: transparent;
          color: var(--color-on-surface-variant, #64748b);
        }
        .tab-inactive:hover {
          background: rgba(0,0,0,0.04);
        }
        .badge-pop { animation: badgePop 0.3s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes badgePop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
 
      {/* ── Top App Bar ── */}
      <nav className="bg-surface-container/80 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-primary tracking-tight font-headline">Smart League</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Search toggle icon */}
          <button
            onClick={() => setSearchOpen(v => !v)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${searchOpen ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-container text-primary hover:bg-surface-container-high'}`}
            aria-label="Toggle search"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: searchOpen ? "'FILL' 1" : "'FILL' 0" }}>
              {searchOpen ? 'close' : 'search'}
            </span>
          </button>
          {userProfile ? (
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10"
              src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.displayName || 'U')}&background=random`}
            />
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* ── Collapsible Search Bar (slides in below navbar) ── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: searchOpen ? '200px' : '0px', opacity: searchOpen ? 1 : 0 }}
      >
        <div className="bg-surface-container/95 backdrop-blur-xl border-b border-outline-variant/20 px-4 sm:px-6 py-4 shadow-md">
          {/* Search input row */}
          <div className="flex items-center gap-2 bg-white border border-outline-variant/30 rounded-2xl px-3 py-2.5 shadow-sm mb-3">
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <input
              autoFocus={searchOpen}
              className="flex-1 min-w-0 bg-transparent text-sm text-on-surface placeholder:text-outline-variant outline-none border-none font-medium"
              placeholder="Search student, school, college, institution…"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-outline-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          {/* Dropdowns row */}
          <div className="flex gap-2 flex-wrap">
            {/* Region dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-outline-variant/20 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <select
                className="explore-select bg-transparent text-xs font-semibold text-on-surface border-none outline-none cursor-pointer"
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
              >
                <option value="">All Regions</option>
                <option value="local">🇮🇳 Local (India)</option>
                <option value="national">🗺️ National</option>
                <option value="global">🌍 Global (Abroad)</option>
              </select>
            </div>
            {/* Institution dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-outline-variant/20 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              <select
                className="explore-select bg-transparent text-xs font-semibold text-on-surface border-none outline-none cursor-pointer"
                value={institutionFilter}
                onChange={e => setInstitutionFilter(e.target.value)}
              >
                <option value="">All Institutions</option>
                <option value="school">🏫 Schools</option>
                <option value="college">🎓 Colleges</option>
                <option value="university">🏛️ Universities</option>
              </select>
            </div>
            {/* Clear filters */}
            {(regionFilter || institutionFilter || searchQuery) && (
              <button
                onClick={() => { setSearchQuery(''); setRegionFilter(''); setInstitutionFilter(''); }}
                className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">filter_list_off</span>
                Clear
              </button>
            )}
          </div>
          {/* Results count */}
          {(searchQuery || regionFilter || institutionFilter) && (
            <p className="text-xs text-outline mt-2 font-medium">
              {filteredFeed.length} result{filteredFeed.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </div>
 
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
 
        {/* ══════════════════════════════════════════
            SECTION 1 — PAGE TITLE
        ══════════════════════════════════════════ */}
        <section className="pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-outline font-inter">Discover Excellence</span>
          <h1 className="text-3xl font-extrabold font-headline text-primary mt-1 tracking-tight">Explore</h1>
        </section>
 
        {/* ══════════════════════════════════════════
            SECTION 2 — CATEGORIES (pill chips)
        ══════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-headline text-on-surface">Browse Categories</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-primary cursor-pointer hover:underline underline-offset-4">View All</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(cat.path)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 active:scale-95 ${cat.color}`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>
 
        {/* ══════════════════════════════════════════
            SECTION 2.5 — FEATURED ACHIEVER (from Firebase featured=true)
        ══════════════════════════════════════════ */}
        {(() => {
          const featuredItems = feedItems.filter(item => item.featured);
          if (featuredItems.length === 0) return null;
          return (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Featured Achiever ⭐
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {featuredItems.map(item => {
                  const studentName = item.studentsData?.length > 0
                    ? (item.studentsData.length === 1 ? item.studentsData[0].name : `${item.studentsData[0].name} & ${item.studentsData.length - 1} more`)
                    : (item.studentName || '');
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/achievement/${item.postSlug || item.id}`)}
                      className="flex-shrink-0 w-72 h-52 rounded-3xl overflow-hidden relative cursor-pointer group"
                      style={{ background: '#0f172a' }}
                    >
                      {(item.imageUrl || item.imageURL) && (
                        <img
                          src={item.imageUrl || item.imageURL}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      {/* Title at top */}
                      <div className="absolute top-3 left-3 right-3">
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                      {/* Content at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                          {item.category}
                        </span>
                        <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-amber-400 text-[16px]" style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 1" }}>verified</span>
                          <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider truncate">
                            {item.institution}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* ══════════════════════════════════════════
            SECTION 3 — HOME FEED (UI + logic unchanged)
        ══════════════════════════════════════════ */}
        <section className="space-y-8">
          {/* Feed Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider font-inter text-outline">Curated Discovery</span>
              <h2 className="text-3xl font-bold text-primary font-headline">Achievement Feed</h2>
            </div>
            
          </div>
 
          {/* Trending Achievement Hero */}
          {heroItem ? (
            <div
              onClick={() => navigate(`/achievement/${heroItem.postSlug || heroItem.id}`)}
              className="relative w-full rounded-[2rem] overflow-hidden bg-primary aspect-[4/5] sm:aspect-[21/9] md:aspect-[21/7] cursor-pointer group shadow-2xl shadow-primary/10"
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
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-primary via-primary/40 to-transparent"></div>
              <div className="relative h-full flex flex-col justify-end sm:justify-center p-6 sm:px-8 md:px-16 max-w-2xl space-y-3 sm:space-y-4">
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
            </div>
          ) : (
            <div className="h-64 bg-surface-container rounded-[2rem] flex items-center justify-center border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-bold">
              No trending achievements yet.
            </div>
          )}
 
          {/* Achievement Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
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
          </div>
 
          {/* Remaining Items Grid */}
          {remainingItems.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-primary font-headline">More Achievements</h2>
                <div className="h-px flex-grow bg-outline-variant/20"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingItems.map((item) => (
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
            </div>
          )}
 
          {displayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-outline-variant text-4xl">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-headline">
                  {(searchQuery || regionFilter || institutionFilter) ? 'No results found' : 'No stories found'}
                </h3>
                <p className="text-on-surface-variant max-w-xs mx-auto">
                  {(searchQuery || regionFilter || institutionFilter)
                    ? 'Try a different name, institution, or clear the filters.'
                    : 'New achievements and news will appear here as soon as they are approved by the administration.'}
                </p>
              </div>
            </div>
          )}
        </section>
 
        {/* ══════════════════════════════════════════
            SECTION 4 — ACHIEVEMENTS (Local / Global / Top)
        ══════════════════════════════════════════ */}
        <section className="space-y-6 pb-8">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-outline font-inter">Leaderboard</span>
              <h2 className="text-2xl font-bold font-headline text-on-surface mt-0.5">Top Achievers</h2>
            </div>
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-2xl border border-outline-variant/15">
              {["global", "local", "top"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAchieverTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${achieverTab === tab ? "tab-active" : "tab-inactive"}`}
                >
                  {tab === "top" ? "🏆 Top" : tab === "global" ? "🌍 Global" : "📍 Local"}
                </button>
              ))}
            </div>
          </div>
 
          {/* Achievers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAchievers.length > 0 ? currentAchievers.map((achiever, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors group cursor-pointer border border-outline-variant/10"
              >
                <span className="text-3xl font-extrabold font-headline text-outline-variant/40 group-hover:text-primary transition-colors w-10 text-center flex-shrink-0">
                  {achiever.rank}
                </span>
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary transition-all">
                  <img alt={achiever.name} className="w-full h-full object-cover" src={achiever.img} />
                </div>
                <div className="flex-grow min-w-0">
                  <h5 className="text-base font-bold font-headline text-primary truncate">{achiever.name}</h5>
                  <p className="text-xs text-on-surface-variant font-medium truncate">{achiever.sub}</p>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${achiever.tagColor} border-current/20`}>
                  {achiever.tag}
                </span>
              </div>
            )) : (
              <div className="md:col-span-2 flex flex-col items-center justify-center py-12 text-center gap-3">
                <span className="material-symbols-outlined text-4xl text-outline-variant">emoji_events</span>
                <p className="text-on-surface-variant font-medium text-sm">
                  {achieverTab === 'local'
                    ? 'No local (India) achievers found yet. Posts with Indian locations will appear here.'
                    : achieverTab === 'global'
                    ? 'No global (abroad) achievers found yet. Posts with international locations will appear here.'
                    : 'No achievers yet. Published posts will show up here.'}
                </p>
              </div>
            )}
          </div>
 
          {/* View All CTA */}
          <div className="flex justify-center pt-2">
            <button className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all duration-200 active:scale-95">
              View Full Leaderboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>
 
      </main>

    </div>
  );
};