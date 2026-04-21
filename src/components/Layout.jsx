// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ─── BOTTOM NAV (Mobile - Student/Teacher) ───────────────────────────────────
export const BottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  if (isAdmin) return null;

  const links = [
    { to: '/feed', icon: 'home', label: 'Home' },
    { to: '/explore', icon: 'emoji_events', label: 'Leagues' },
    { to: '/network', icon: 'people', label: 'Network' },
    { to: '/profile', icon: 'account_circle', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-outline-variant/20 pb-safe">
      <div className="flex gap-2 px-4 pb-3 pt-2">
        {links.map(({ to, icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link key={to} to={to} className={`flex flex-1 flex-col items-center justify-end gap-1 rounded-full ${active ? 'text-primary' : 'text-on-surface-variant/60'}`}>
              <div className="flex h-8 items-center justify-center">
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
              </div>
              <p className={`text-xs leading-normal tracking-[0.015em] ${active ? 'font-bold' : 'font-medium'}`}>{label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// ─── GLASS TOP BAR (Mobile - Student/Teacher) ────────────────────────────────
export const MobileTopBar = ({ title, showSearch, showBack }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="flex items-center p-4 pb-2 justify-between">
        {showBack ? (
          <button onClick={() => navigate(-1)} className="flex size-12 shrink-0 items-center">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
        ) : (
          <div className="flex size-12 shrink-0 items-center">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="avatar" className="size-10 rounded-full border-2 border-primary-fixed object-cover" />
            ) : (
              <div className="size-10 rounded-full border-2 border-primary-fixed bg-primary-container flex items-center justify-center text-on-primary font-bold text-sm">
                {(userProfile?.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
        )}
        <h2 className="text-primary font-headline text-xl font-extrabold leading-tight tracking-[-0.02em] flex-1 text-center uppercase">
          {title || 'Smart League'}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-full h-10 w-10 bg-surface-container-low text-primary transition-colors hover:bg-surface-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
          </button>
        </div>
      </div>
      {showSearch && (
        <div className="px-4 py-3">
          <div className="flex w-full items-stretch rounded-full bg-surface-container-low h-12 overflow-hidden focus-within:ring-2 ring-primary/20 transition-all">
            <div className="text-on-surface-variant flex items-center justify-center pl-4">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input className="w-full border-none bg-transparent focus:ring-0 px-3 text-on-surface placeholder:text-outline text-base" placeholder="Search students or achievements" />
          </div>
        </div>
      )}
    </header>
  );
};

// ─── ADMIN SIDEBAR ────────────────────────────────────────────────────────────
export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/students', icon: 'school', label: 'Students' },
    { to: '/admin/achievements', icon: 'workspace_premium', label: 'Achievements' },
    { to: '/admin/news', icon: 'edit_note', label: 'Newsroom' },
    { to: '/admin/criteria', icon: 'rule', label: 'Criteria Editor' },
    { to: '/admin/users', icon: 'manage_accounts', label: 'Users & Permissions' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`h-screen ${collapsed ? 'w-16' : 'w-64'} fixed left-0 top-0 flex-col hidden lg:flex bg-slate-50 border-r border-slate-200/50 pt-0 transition-all duration-300 z-40`}>
      {/* Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-slate-200/50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-sm">star</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary font-headline tracking-tight">Admin Portal</h2>
              <p className="text-[9px] uppercase tracking-widest text-outline font-medium">Smart League</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-slate-200 transition-colors ml-auto">
          <span className="material-symbols-outlined text-outline text-sm">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-grow flex flex-col gap-1 px-2 pt-4">
        {navItems.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-inter text-sm font-medium ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-0.5'}`}>
              <span className="material-symbols-outlined text-xl shrink-0" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 mt-auto border-t border-slate-200/50 pt-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {(userProfile?.displayName || 'A')[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate">{userProfile?.displayName || 'Admin'}</p>
              <p className="text-[10px] text-outline uppercase tracking-wider">Administrator</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-error transition-all`}>
          <span className="material-symbols-outlined text-xl shrink-0">logout</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

// ─── ADMIN TOP BAR ────────────────────────────────────────────────────────────
export const AdminTopBar = () => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-xl h-16 flex items-center px-8 border-b border-slate-200/30 lg:pl-72">
      <div className="flex items-center justify-between w-full">
        <div className="lg:hidden flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-sm">star</span>
          </div>
          <span className="font-bold text-primary text-sm tracking-tight">Smart League Admin</span>
        </div>
        <div className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-outline text-sm">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-48 ml-2 outline-none" placeholder="Search..." />
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button onClick={() => navigate('/admin/news/new')} className="bg-primary text-on-primary px-4 py-1.5 rounded-full font-label text-sm font-semibold hover:opacity-90 transition-all hidden md:block">
            + Publish News
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-primary cursor-pointer">
            {(userProfile?.displayName || 'A')[0]}
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── ROUTE GUARDS ─────────────────────────────────────────────────────────────
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading) {
      if (!currentUser) navigate('/login', { state: { from: location }, replace: true });
      else if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [currentUser, userProfile, loading, navigate, location, allowedRoles]);

  if (loading || !currentUser) return <LoadingScreen />;
  return children;
};

export const LoadingScreen = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
        <span className="material-symbols-outlined text-on-primary">star</span>
      </div>
      <p className="text-outline font-medium text-sm tracking-wide">Smart League</p>
    </div>
  </div>
);
