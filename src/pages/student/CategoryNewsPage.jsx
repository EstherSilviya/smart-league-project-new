import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// ── Category config — colors & icons matching your existing design ──
const CATEGORY_CONFIG = {
  sports: {
    label: "Sports",
    icon: "sports_basketball",
    headerBg: "bg-secondary-container",
    headerText: "text-on-secondary-container",
    tagBg: "bg-secondary-container/30",
    tagText: "text-on-secondary-container",
  },
  research: {
    label: "Research",
    icon: "biotech",
    headerBg: "bg-tertiary-container",
    headerText: "text-on-tertiary-container",
    tagBg: "bg-tertiary-container/30",
    tagText: "text-on-tertiary-container",
  },
  tech: {
    label: "Tech",
    icon: "terminal",
    headerBg: "bg-primary-container",
    headerText: "text-on-primary-container",
    tagBg: "bg-primary-container/20",
    tagText: "text-on-primary-container",
  },
  arts: {
    label: "Arts",
    icon: "palette",
    headerBg: "bg-surface-container-highest",
    headerText: "text-on-surface-variant",
    tagBg: "bg-surface-container-highest",
    tagText: "text-on-surface-variant",
  },
  service: {
    label: "Service",
    icon: "diversity_1",
    headerBg: "bg-primary/10",
    headerText: "text-primary",
    tagBg: "bg-primary/10",
    tagText: "text-primary",
  },
};

// ── Single news card — shows only Photo + Title + StudentName + Likes ──
function NewsCard({ news, index, config }) {
  const navigate = useNavigate();

  const title       = news.title;
  const studentName = news.studentName;
  const likes       = news.likes ?? 0;
  const imageUrl    = news.imageUrl || null;
  const date        = news.createdAt?.toDate
    ? news.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Recently Published";

  return (
    <article
      className="bg-white rounded-3xl overflow-hidden border border-outline-variant/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      style={{
        animation: `fadeUp 0.4s ease forwards`,
        animationDelay: `${index * 80}ms`,
        opacity: 0,
      }}
      onClick={() => navigate(`/achievement/${news.postSlug || news.id}`)}
    >
      {/* ── Photo ── */}
      <div className="relative w-full h-56 overflow-hidden bg-surface-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high">
            <span className="material-symbols-outlined text-outline-variant text-6xl">image</span>
            <p className="text-outline-variant text-xs mt-2">No image provided</p>
          </div>
        )}

        {/* Category tag */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${config.tagBg} ${config.tagText} backdrop-blur-sm`}>
          {config.label}
        </span>

        {/* Date */}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/40 text-white text-[10px] font-semibold backdrop-blur-sm">
          {date}
        </span>
      </div>

      {/* ── Card Content: Title + StudentName + Likes only ── */}
      <div className="p-6 space-y-3">

        {/* Title */}
        <h3 className="text-xl font-extrabold font-headline text-primary leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Student Name */}
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-sm font-semibold">{studentName || "—"}</span>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span className="text-xs font-semibold">{likes} Likes</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant/30" />

        {/* ✅ Read Full Story */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
            Read Full Story
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {news.status || "Live"}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export const CategoryNewsPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = CATEGORY_CONFIG[categoryName?.toLowerCase()] || {
    label: categoryName,
    icon: "article",
    headerBg: "bg-primary-container",
    headerText: "text-on-primary-container",
    tagBg: "bg-primary-container/20",
    tagText: "text-on-primary-container",
  };

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "news"));
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            category: d.category?.trim().toLowerCase(),
            imageUrl: d.imageUrl || d.image || d.photoURL || null,
          };
        });

        const filtered = data.filter(item =>
          item.category === categoryName?.trim().toLowerCase() &&
          item.status === "published"
        );

        setNewsList(filtered);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
      setLoading(false);
    };

    fetchNews();
  }, [categoryName]);

  return (
    <div className="bg-surface font-body text-on-background min-h-screen pb-32">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="bg-slate-50/80 backdrop-blur-xl flex items-center gap-4 px-6 py-4 w-full top-0 sticky z-50 border-b border-outline-variant/10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${config.headerText} text-2xl`}
                style={{ fontVariationSettings: "'FILL' 1" }}>
            {config.icon}
          </span>
          <h1 className="text-xl font-bold font-headline text-primary">
            {config.label} News
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* ── Hero banner ── */}
        <div className={`${config.headerBg} ${config.headerText} rounded-3xl p-8 flex items-center gap-6`}>
          <span className="material-symbols-outlined text-6xl"
                style={{ fontVariationSettings: "'FILL' 1" }}>
            {config.icon}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Browse Field</p>
            <h2 className="text-3xl font-extrabold font-headline">{config.label} Excellence</h2>
            <p className="text-sm opacity-70 mt-1">
              {loading ? "Loading..." : `${newsList.length} published article${newsList.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">Loading {config.label} news...</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && newsList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-outline-variant text-4xl">newspaper</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-primary mb-2">No {config.label} News Yet</h3>
            <p className="text-sm text-on-surface-variant max-w-xs">
              Once the admin publishes news under <strong>{config.label}</strong>, it will appear here automatically.
            </p>
          </div>
        )}

        {/* ── Featured card (first article — big) ── */}
        {!loading && newsList.length > 0 && (
          <article
            className="group relative w-full rounded-3xl overflow-hidden cursor-pointer bg-primary"
            style={{ height: "400px" }}
            onClick={() => navigate(`/achievement/${newsList[0].postSlug || newsList[0].id}`)}
          >
            {newsList[0].imageUrl && (
              <img
                src={newsList[0].imageUrl}
                alt={newsList[0].title}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 ${config.tagBg} ${config.tagText}`}>
                {config.label}
              </span>

              <h3 className="text-2xl md:text-3xl font-extrabold font-headline text-white leading-tight mb-2">
                {newsList[0].title}
              </h3>

              <div className="flex items-center gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  {newsList[0].studentName || "—"}
                </span>
                <span className="flex items-center gap-1 text-white/70 text-sm">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  {newsList[0].likes ?? 0} Likes
                </span>
              </div>

              <button
                className="mt-2 px-6 py-2.5 bg-white text-primary rounded-full text-sm font-bold hover:bg-surface-container-high transition-colors flex items-center gap-2"
              >
                Read Full Story
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </article>
        )}

        {/* ── Magazine grid (remaining articles) ── */}
        {!loading && newsList.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.slice(1).map((news, index) => (
              <NewsCard key={news.id} news={news} index={index} config={config} />
            ))}
          </div>
        )}

        {/* ── Back button ── */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-blue-900 active:scale-95 transition-all duration-150 shadow-lg"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Explore
          </button>
        </div>
      </main>
    </div>
  );
};
