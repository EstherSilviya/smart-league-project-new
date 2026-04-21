// src/pages/shared/StudentSpotlight.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents, getAchievements } from '../../firebase/firestore';
import { MobileTopBar, BottomNav } from '../../components/Layout';

export const StudentSpotlight = () => {
  const [spotlight, setSpotlight] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const students = await getStudents();
      if (students.length === 0) { setLoading(false); return; }
      // Pick student with most achievements or first student
      const student = students[0];
      const a = await getAchievements({ studentId: student.id });
      setSpotlight(student);
      setAchievements(a);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-pulse text-outline">Loading spotlight...</div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-surface overflow-x-hidden">
      <MobileTopBar title="Spotlight" showBack />

      <main className="pb-28">
        {!spotlight ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-6">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">star</span>
            <h3 className="font-headline text-2xl font-bold text-primary mb-2">No Spotlight Yet</h3>
            <p className="text-on-surface-variant text-sm">The student of the moment will appear here.</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <section className="relative bg-primary text-on-primary overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container" />
              <div className="relative z-10 px-6 pt-12 pb-16">
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-secondary-container text-on-secondary-fixed-variant text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Student of the Moment
                  </span>
                </div>
                <div className="flex items-end gap-6">
                  <div className="relative shrink-0">
                    {spotlight.photoURL ? (
                      <img src={spotlight.photoURL} alt={spotlight.displayName}
                        className="w-28 h-28 rounded-3xl object-cover border-4 border-secondary-container shadow-2xl transform rotate-2" />
                    ) : (
                      <div className="w-28 h-28 rounded-3xl bg-primary-container flex items-center justify-center text-5xl font-bold text-primary border-4 border-secondary-container shadow-2xl transform rotate-2">
                        {(spotlight.displayName || 'S')[0]}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-secondary-container rounded-full p-1.5 shadow-lg">
                      <span className="material-symbols-outlined text-on-secondary-fixed text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                  </div>
                  <div className="flex-1 pb-2">
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight leading-tight">
                      {spotlight.displayName}
                    </h1>
                    <p className="text-on-primary/70 text-sm mt-1 font-medium">{spotlight.institution}</p>
                    {spotlight.bio && <p className="text-on-primary/60 text-sm mt-2 line-clamp-2">{spotlight.bio}</p>}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-8">
                  {[
                    { label: 'Achievements', value: achievements.length },
                    { label: 'Categories', value: [...new Set(achievements.map(a => a.category))].length },
                    { label: 'Role', value: spotlight.role || 'Student' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <p className="font-headline text-2xl font-extrabold text-on-primary">{value}</p>
                      <p className="text-on-primary/60 text-[10px] uppercase tracking-widest font-bold mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Achievements */}
            <section className="px-6 pt-8">
              <h2 className="font-headline text-xl font-extrabold text-primary mb-5">Highlighted Achievements</h2>
              {achievements.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">workspace_premium</span>
                  <p className="text-on-surface-variant text-sm">No achievements yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {achievements.slice(0, 5).map(a => (
                    <div key={a.id} className="bg-surface-container-low rounded-2xl p-5 flex gap-4">
                      {a.imageURL ? (
                        <img src={a.imageURL} alt={a.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-on-secondary-container bg-secondary-container/30 px-2 py-0.5 rounded uppercase">{a.category}</span>
                        <h4 className="font-bold text-on-surface mt-1">{a.title}</h4>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="px-6 mt-8">
              <Link to={`/profile/${spotlight.id}`}
                className="flex items-center justify-center gap-2 h-12 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">person</span>
                View Full Profile
              </Link>
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};
