import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendEmail } from '../../utils/emailService';

export const SuperAdminPortal = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingNews, setPendingNews] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('institutions'); // 'institutions', 'news', or 'all_users'

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pending management accounts
      const qPending = query(collection(db, 'users'), where('role', '==', 'management'), where('status', '==', 'pending'));
      const snapPending = await getDocs(qPending);
      setPendingUsers(snapPending.docs.map(d => ({ id: d.id, ...d.data() })));

      // 2. Fetch news posts (pending and published for overview)
      const qNews = query(collection(db, 'news')); // Fetch all to ensure visibility
      const snapNews = await getDocs(qNews);
      setPendingNews(snapNews.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        imageUrl: d.data().imageUrl || d.data().imageURL || d.data().image // Handle all variants
      })));

      // 3. Fetch active administrative staff (Institutions & Management)
      const qAllInst = query(
        collection(db, 'users'), 
        where('role', 'in', ['management', 'teacher', 'editor']), 
        where('status', '==', 'active')
      );
      const snapAllInst = await getDocs(qAllInst);
      setAllInstitutions(snapAllInst.docs.map(d => ({ id: d.id, ...d.data() })));

      // 4. Fetch ALL users (for cleanup)
      const snapAllUsers = await getDocs(collection(db, 'users'));
      setAllUsers(snapAllUsers.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (user) => {
    if (!window.confirm(`Approve management account for ${user.displayName}?`)) return;
    try {
      await updateDoc(doc(db, 'users', user.id), { status: 'active' });
      
      // Trigger Approval Email via Nodemailer
      await sendEmail({
        to: user.email,
        subject: 'Account Approved - Welcome to Smart League!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1c1e;">
            <h2 style="color: #002045;">Great news, ${user.displayName}!</h2>
            <p>Your management account for <strong>${user.institution}</strong> has been approved.</p>
            <p>You can now sign in to the Admin Portal to start managing your institution's digital presence.</p>
            <div style="margin-top: 30px;">
              <a href="${window.location.origin}/login" style="background-color: #002045; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Sign In to Dashboard</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #74777f;">Best regards,<br/>Smart League Administration</p>
          </div>
        `
      });

      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      alert('Institution approved and notification email sent! ✅');
      fetchData();
    } catch (err) {
      alert('Failed to approve user: ' + err.message);
    }
  };

  const handleApproveNews = async (newsId) => {
    if (!window.confirm('Approve this news post for public release?')) return;
    try {
      await updateDoc(doc(db, 'news', newsId), { status: 'published' });
      setPendingNews(prev => prev.filter(n => n.id !== newsId));
      alert('News published successfully! 📰');
    } catch (err) {
      alert('Failed to approve news: ' + err.message);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Reject and delete this news post?')) return;
    try {
      await deleteDoc(doc(db, 'news', newsId));
      setPendingNews(prev => prev.filter(n => n.id !== newsId));
    } catch (err) {
      alert('Failed to delete news: ' + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user COMPLETELY? This will also remove them from Firebase Auth so the email can be reused.')) return;
    try {
      // Call Backend to delete from Auth and Firestore
      const response = await fetch('http://localhost:5000/delete-user-completely', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user from Auth');
      }

      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setAllInstitutions(prev => prev.filter(u => u.id !== userId));
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      alert('User wiped completely! You can now reuse that email. ✅');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter users based on search
  const filteredActive = allInstitutions.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#faf9fd] text-[#1a1c1e] min-h-screen font-manrope">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2 border-r border-slate-100 z-40">
        <div className="mb-8 px-2 py-4">
          <h1 className="text-lg font-extrabold text-[#002045] uppercase tracking-widest">Smart League</h1>
          <p className="text-xs text-slate-500 font-medium tracking-tight">Super Admin Hub</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <button 
            onClick={() => setActiveView('institutions')}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg font-medium text-sm ${activeView === 'institutions' ? 'bg-white text-[#002045] font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <span className="material-symbols-outlined" style={activeView === 'institutions' ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
            <span>Institutions</span>
          </button>

          <button 
            onClick={() => setActiveView('news')}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg font-medium text-sm ${activeView === 'news' ? 'bg-white text-[#002045] font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <span className="material-symbols-outlined" style={activeView === 'news' ? { fontVariationSettings: "'FILL' 1" } : {}}>article</span>
            <span>News Review</span>
            {pendingNews.length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingNews.length}</span>}
          </button>

          <button 
            onClick={() => setActiveView('all_users')}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg font-medium text-sm ${activeView === 'all_users' ? 'bg-white text-[#002045] font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <span className="material-symbols-outlined" style={activeView === 'all_users' ? { fontVariationSettings: "'FILL' 1" } : {}}>manage_accounts</span>
            <span>All Users (Wipe)</span>
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 flex flex-col gap-1">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-error transition-all rounded-lg font-medium text-sm">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 p-12 max-w-7xl">
        <header className="mb-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1a365d]">System Administration</span>
              <h2 className="text-5xl font-black tracking-tighter text-[#1a1c1e]">User Access Control</h2>
              <p className="text-lg text-[#43474e]/80 max-w-2xl mt-4 leading-relaxed">
                Manage organizational permissions and scholarly roles. Add new administrators, adjust editorial rights, or revoke management access from the central authority hub.
              </p>
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm text-[#002045] hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh Data
            </button>
          </div>
        </header>

        {/* Metrics Section */}
        <section className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-8 bg-[#f4f3f7] rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs font-bold uppercase text-[#74777f] mb-1 tracking-widest">Total Institutions</p>
                <p className="text-2xl font-black text-[#002045]">{allInstitutions.length}</p>
              </div>
              <div className="w-px h-10 bg-[#c4c6cf]/30"></div>
              <div>
                <p className="text-xs font-bold uppercase text-[#74777f] mb-1 tracking-widest">Pending Review</p>
                <p className="text-2xl font-black text-[#002045]">{pendingUsers.length}</p>
              </div>
            </div>
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-sm">search</span>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-none ring-1 ring-[#c4c6cf]/20 focus:ring-[#1a365d] text-sm py-2.5 pl-10 pr-4 rounded-lg outline-none transition-all" 
                placeholder="Search by name or email..." 
                type="text"
              />
            </div>
          </div>
          <div className="col-span-4 bg-[#1a365d] rounded-xl p-6 text-white relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#86a0cd] mb-1">Security Audit</p>
              <p className="text-sm opacity-90 leading-snug">Global permission review is active. 2 accounts require immediate verification.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">shield_person</span>
            </div>
          </div>
        </section>

        {/* Main List */}
        <div className="bg-[#f4f3f7] rounded-xl overflow-hidden shadow-sm">
          {activeView === 'institutions' && (
            <>
              <div className="grid grid-cols-12 px-8 py-4 bg-[#e9e7eb]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#74777f]">
                <div className="col-span-5">Identity & Contact</div>
                <div className="col-span-3">Status / Role</div>
                <div className="col-span-2 text-center">Institution</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-[#c4c6cf]/10">
                {pendingUsers.map(user => (
                  <div key={user.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-[#e9e7eb]/20 transition-colors bg-amber-50/30">
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#d5e0f7] flex items-center justify-center text-[#1a365d] font-bold">
                        {user.displayName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1c1e]">{user.displayName}</p>
                        <p className="text-sm text-[#74777f]">{user.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border border-amber-200">Pending</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xs font-bold text-[#002045]">{user.institution}</p>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button onClick={() => handleApprove(user)} className="bg-[#002045] text-white px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-md">Approve</button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-[#74777f] hover:text-[#ba1a1a] transition-colors hover:bg-white rounded-lg">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {filteredActive.map(user => (
                  <div key={user.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-[#e9e7eb]/20 transition-colors">
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#d5e0f7] flex items-center justify-center text-[#1a365d] font-bold">
                        {user.displayName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1c1e]">{user.displayName}</p>
                        <p className="text-sm text-[#74777f]">{user.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border border-[#1a365d]/20">
                        {user.role}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-xs font-bold text-[#002045]">{user.institution}</p>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-[#74777f] hover:text-[#ba1a1a] transition-colors hover:bg-white rounded-lg">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeView === 'news' && (
            <>
              <div className="grid grid-cols-12 px-8 py-4 bg-[#e9e7eb]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#74777f]">
                <div className="col-span-5">Post Details / Author</div>
                <div className="col-span-3">Institution</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-[#c4c6cf]/10">
                {pendingNews
                  .filter(post => post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || post.authorName?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .sort((a, b) => (b.status === 'pending' ? 1 : -1))
                  .map(post => (
                  <div key={post.id} className={`grid grid-cols-12 px-8 py-6 items-center hover:bg-[#e9e7eb]/20 transition-colors ${post.status === 'pending' ? 'bg-blue-50/30' : ''}`}>
                    <div className="col-span-5 flex items-center gap-4">
                      {post.imageUrl ? <img src={post.imageUrl} alt="post" className="w-16 h-12 rounded object-cover border border-outline-variant/30" /> : <div className="w-16 h-12 rounded bg-surface-container flex items-center justify-center text-outline text-[8px] uppercase">No Image</div>}
                      <div>
                        <p className="font-bold text-[#1a1c1e] line-clamp-1">{post.title}</p>
                        <p className="text-xs text-[#74777f]">By {post.authorName} ({post.authorRole})</p>
                      </div>
                    </div>
                    <div className="col-span-3"><p className="text-sm font-bold text-[#002045]">{post.institution}</p></div>
                    <div className="col-span-2 text-center">
                      <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border ${post.status === 'pending' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      {post.status === 'pending' && (
                        <button onClick={() => handleApproveNews(post.id)} className="bg-[#002045] text-white px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-md">Approve</button>
                      )}
                      <button onClick={() => handleDeleteNews(post.id)} className="p-2 text-[#74777f] hover:text-[#ba1a1a] transition-colors hover:bg-white rounded-lg"><span className="material-symbols-outlined text-xl">delete</span></button>
                    </div>
                  </div>
                ))}
                {pendingNews.length === 0 && <div className="p-12 text-center text-[#74777f] uppercase tracking-widest text-xs font-bold">No news posts found.</div>}
              </div>
            </>
          )}

          {activeView === 'all_users' && (
            <>
              <div className="grid grid-cols-12 px-8 py-4 bg-[#e9e7eb]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#74777f]">
                <div className="col-span-5">User Identity</div>
                <div className="col-span-3">Role / Status</div>
                <div className="col-span-2 text-center">Institution</div>
                <div className="col-span-2 text-right">Wipe Account</div>
              </div>
              <div className="divide-y divide-[#c4c6cf]/10">
                {allUsers.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                  <div key={user.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-red-50/20 transition-colors">
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">{user.displayName?.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-[#1a1c1e]">{user.displayName}</p>
                        <p className="text-sm text-[#74777f]">{user.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>{user.role}</span>
                      <span className="text-[10px] opacity-50 uppercase font-bold">{user.status}</span>
                    </div>
                    <div className="col-span-2 text-center"><p className="text-xs font-bold text-[#002045]">{user.institution || 'N/A'}</p></div>
                    <div className="col-span-2 flex justify-end">
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-[#74777f] hover:text-[#ba1a1a] transition-colors hover:bg-white rounded-lg">
                        <span className="material-symbols-outlined text-xl">delete_forever</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

            {loading && (
               <div className="p-12 text-center text-[#74777f] animate-pulse font-bold uppercase tracking-widest text-xs">
                 Synchronizing Authority Hub...
               </div>
            )}
            
            {!loading && pendingUsers.length === 0 && filteredActive.length === 0 && (
               <div className="p-12 text-center text-[#74777f]">
                 No users found matching your search.
               </div>
            )}
          </div>

          <div className="px-8 py-6 bg-[#f4f3f7] flex justify-between items-center border-t border-[#c4c6cf]/10">
            <p className="text-xs font-bold text-[#74777f] uppercase tracking-widest">
              Reviewing authority hierarchy
            </p>
          </div>
        </main>
      </div>
    );
  };
