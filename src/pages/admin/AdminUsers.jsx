// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserProfile } from '../../firebase/firestore';
import { AdminSidebar, AdminTopBar } from '../../components/Layout';

const ROLES = ['student', 'teacher', 'admin'];

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    getAllUsers().then(data => { setUsers(data); setLoading(false); });
  }, []);

  const handleRoleChange = async (uid, newRole) => {
    setUpdating(uid);
    await updateUserProfile(uid, { role: newRole });
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
    setUpdating(null);
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-primary">Users & Permissions</h1>
              <p className="text-on-surface-variant text-sm">{users.length} total users</p>
            </div>
            <div className="flex items-center bg-surface-container-low rounded-xl px-4 h-10 gap-2 focus-within:ring-2 ring-primary/30">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input className="bg-transparent border-none outline-none text-sm w-48"
                placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Role stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'All Users', value: users.length, role: 'all', icon: 'people' },
              { label: 'Students', value: roleCounts.student || 0, role: 'student', icon: 'school' },
              { label: 'Teachers', value: roleCounts.teacher || 0, role: 'teacher', icon: 'person_book' },
              { label: 'Admins', value: roleCounts.admin || 0, role: 'admin', icon: 'admin_panel_settings' },
            ].map(({ label, value, role, icon }) => (
              <button key={role} onClick={() => setFilterRole(role)}
                className={`p-5 rounded-2xl flex flex-col items-start gap-2 transition-all text-left ${filterRole === role ? 'bg-primary text-on-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined text-xl" style={filterRole === role ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                <div>
                  <p className={`text-2xl font-extrabold ${filterRole === role ? 'text-on-primary' : 'text-primary'}`}>{value}</p>
                  <p className={`text-xs font-bold uppercase tracking-widest ${filterRole === role ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Users table */}
          <div className="bg-surface-container-low rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {['User', 'Email', 'Institution', 'Role', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10">
                        {[1,2,3,4,5].map(j => <td key={j} className="px-6 py-4"><div className="h-4 bg-surface-container rounded animate-pulse" /></td>)}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">No users found.</td></tr>
                  ) : filtered.map(user => (
                    <tr key={user.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-primary">
                              {(user.displayName || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <p className="font-semibold text-on-surface text-sm">{user.displayName || 'Unnamed'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{user.institution || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide
                          ${user.role === 'admin' ? 'bg-primary text-on-primary' :
                            user.role === 'teacher' ? 'bg-secondary-container text-on-secondary-fixed-variant' :
                            'bg-surface-container-highest text-on-surface-variant'}`}>
                          {user.role || 'student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || 'student'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updating === user.id}
                          className="bg-surface-container-high rounded-lg px-3 py-1.5 text-xs font-semibold outline-none border-none cursor-pointer disabled:opacity-50"
                        >
                          {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
