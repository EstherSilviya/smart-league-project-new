// src/pages/admin/AdminStudentsList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents } from '../../firebase/firestore';
import { AdminSidebar, AdminTopBar } from '../../components/Layout';

export const AdminStudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    getStudents().then(data => { setStudents(data); setLoading(false); });
  }, []);

  const filtered = students
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return s.displayName?.toLowerCase().includes(q) || s.institution?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.displayName || '').localeCompare(b.displayName || '');
      if (sortBy === 'institution') return (a.institution || '').localeCompare(b.institution || '');
      return 0;
    });

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />

      <main className="lg:pl-64 pt-16">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-primary mb-1">Student Directory</h1>
              <p className="text-on-surface-variant text-sm">{students.length} registered students</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center bg-surface-container-low rounded-xl px-4 h-10 gap-2 focus-within:ring-2 ring-primary/30">
                <span className="material-symbols-outlined text-outline text-sm">search</span>
                <input className="bg-transparent border-none outline-none text-sm w-48"
                  placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-surface-container-low rounded-xl px-4 h-10 text-sm outline-none border-none">
                <option value="name">Sort: Name</option>
                <option value="institution">Sort: Institution</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-low rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="px-8 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Student</th>
                    <th className="px-4 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Institution</th>
                    <th className="px-4 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Email</th>
                    <th className="px-4 py-4 text-xs uppercase tracking-widest font-bold text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10">
                        {[1,2,3,4].map(j => <td key={j} className="px-6 py-4"><div className="h-4 bg-surface-container rounded animate-pulse" /></td>)}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-16 text-center text-on-surface-variant">
                      {search ? 'No students match your search.' : 'No students registered yet.'}
                    </td></tr>
                  ) : filtered.map(student => (
                    <tr key={student.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt={student.displayName} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-primary">
                              {(student.displayName || 'S')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-on-surface text-sm">{student.displayName || 'Unnamed'}</p>
                            <p className="text-[10px] text-outline uppercase tracking-wide">Student</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">{student.institution || '—'}</td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">{student.email}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/admin/students/${student.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high rounded-lg text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all">
                            <span className="material-symbols-outlined text-xs">visibility</span> View
                          </Link>
                          <Link to={`/admin/achievements/assign/${student.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-secondary-container rounded-lg text-xs font-semibold text-on-secondary-fixed-variant hover:opacity-80 transition-all">
                            <span className="material-symbols-outlined text-xs">workspace_premium</span> Award
                          </Link>
                        </div>
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
