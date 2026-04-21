// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, LoadingScreen } from './components/Layout';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';

// Auth
import { Login, Signup, ForgotPassword } from './pages/auth/Auth';

// Student
import { HomeFeed } from './pages/student/HomeFeed';
import { StudentProfile } from './pages/student/StudentProfile';
import { ExploreAchievements } from './pages/student/ExploreAchievements';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudentsList } from './pages/admin/AdminStudentsList';
import { AdminAssignAchievement, AdminStudentDetail } from './pages/admin/AdminAchievements';
import { AdminNewsList } from './pages/admin/AdminNews';
import { AdminNewsEditor } from './pages/admin/AdminNewsEditor';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCriteriaEditor } from './pages/admin/AdminCriteriaEditor';

// Teacher
import { TeacherDashboard, TeacherStudents } from './pages/teacher/TeacherDashboard';

// Shared
import { StudentSpotlight } from './pages/shared/StudentSpotlight';

// New Pages
import { AdminPortal } from './pages/admin/AdminPortal';
import { AchievementDetail } from './pages/student/AchievementDetail';
import { SuperAdminPortal } from './pages/admin/SuperAdminPortal';
import { CategoryNewsPage } from './pages/student/CategoryNewsPage';

const PendingApproval = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-6">
    <span className="material-symbols-outlined text-6xl text-primary mb-4">hourglass_empty</span>
    <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Account Pending Approval</h1>
    <p className="text-on-surface-variant mb-6">Your registration is currently under review by an administrator. You will be notified via email once approved.</p>
    <button onClick={() => window.location.href = '/login'} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">
      Return to Login
    </button>
  </div>
);

// ─── ADMIN UPGRADE TOOL (Temporary) ───────────────────────────────────────────
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase/config';
import { setDoc } from 'firebase/firestore';

const MakeMeAdmin = () => {
  const [email, setEmail] = React.useState('esthersilviya900@gmail.com');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (password.length < 6) return alert('Password must be at least 6 characters');
    
    setLoading(true);
    try {
      // Create the user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create the admin profile in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email,
        displayName: 'Super Admin',
        role: 'admin',
        status: 'active',
        createdAt: new Date()
      });
      
      alert('Success! Admin account created. You are now logged in as Super Admin.');
      window.location.href = '/admin';
    } catch (e) {
      alert('Error: ' + e.message + '\n\nIf it says email-already-in-use, you already created it! Just go to Login instead.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-6">
      <div className="bg-surface-container-low p-8 rounded-2xl max-w-md w-full shadow-lg">
        <span className="material-symbols-outlined text-6xl text-primary mb-4">admin_panel_settings</span>
        <h1 className="font-headline text-2xl font-extrabold text-primary mb-2">Create Super Admin</h1>
        <p className="text-on-surface-variant text-sm mb-6">Creates your master admin account directly, bypassing the regular signup form.</p>
        
        <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 bg-surface-container rounded-xl px-4 mt-1" required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Create Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 bg-surface-container rounded-xl px-4 mt-1" placeholder="Min 6 characters" required />
          </div>
          <button type="submit" disabled={loading} className="w-full mt-4 bg-primary text-on-primary h-12 rounded-full font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── ROOT REDIRECT (role-based) ───────────────────────────────────────────────
const RootRedirect = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) { navigate('/login', { replace: true }); return; }
    if (!userProfile) return; // wait for profile to load

    if (userProfile.status === 'pending') {
      navigate('/pending-approval', { replace: true });
      return;
    }

    if (userProfile.role === 'admin') {
      navigate('/super-admin', { replace: true });
    } else if (userProfile.role === 'management' || userProfile.role === 'teacher') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/feed', { replace: true });
    }
  }, [currentUser, userProfile, loading, navigate]);

  return <LoadingScreen />;
};

// ─── UNAUTHORIZED PAGE ────────────────────────────────────────────────────────
const Unauthorized = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-6">
    <span className="material-symbols-outlined text-6xl text-outline mb-4">lock</span>
    <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Access Denied</h1>
    <p className="text-on-surface-variant mb-6">You don't have permission to view this page.</p>
    <a href="/" className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">
      Go Home
    </a>
  </div>
);

// ─── NOT FOUND ────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-6">
    <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
    <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Page Not Found</h1>
    <p className="text-on-surface-variant mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">
      Go Home
    </a>
  </div>
);

// ─── APP ROUTES ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Root → role-based redirect */}
    <Route path="/" element={<RootRedirect />} />
    <Route path="/pending-approval" element={<PendingApproval />} />
    <Route path="/make-me-admin" element={<MakeMeAdmin />} />

    {/* ── PUBLIC/STUDENT ROUTES ── */}
    <Route path="/feed" element={<HomeFeed />} />
    <Route path="/explore" element={<ExploreAchievements />} />
    <Route path="/category/:categoryName" element={<CategoryNewsPage />} />
    <Route path="/achievement/:postId" element={<AchievementDetail />} />
    <Route path="/news/:postId" element={<AchievementDetail />} />
    <Route path="/profile/:slug" element={<StudentProfile />} />
    <Route path="/spotlight" element={<StudentSpotlight />} />

    {/* ── ADMIN/MANAGEMENT/EDITOR PORTAL ── */}
    <Route path="/admin/*" element={
      <ProtectedRoute allowedRoles={['management', 'teacher']}>
        <AdminPortal />
      </ProtectedRoute>
    } />

    {/* ── SUPER ADMIN PORTAL ── */}
    <Route path="/super-admin" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <SuperAdminPortal />
      </ProtectedRoute>
    } />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
