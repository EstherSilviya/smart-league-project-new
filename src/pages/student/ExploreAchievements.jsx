import React from "react";
import { useNavigate, Link } from "react-router-dom";

export const ExploreAchievements = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body text-on-background min-h-screen pb-32">
      <style>{`
        .glass-effect { backdrop-filter: blur(20px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .tonal-transition { transition: all 0.3s ease; }
      `}</style>

      {/* ── Header ── */}
      <header className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full docked full-width top-0 sticky z-50 tonal-transition border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
            <img 
              alt="Student Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj3XpYHf18K4rl9B3BKhU4Zd40GLhBkGumVQxwyJJiFkBMHw8taxYbOrPCHglyagLiQH7VvnrvG7BkAiY_ptjfnYFi63nx9m9aqUEePvgSwq9HsZ5XVZWINu1X2onvbF1ZaMkWL71KcjPS7pL-X_at-bsbC4_nawyxE6lyQ_u5ZUE1T0fV_Q9fLXxT9r_0VrLAxVbqJV6ltTToosqosztFxpwx4iRXZIMgZEA2PulgQOI0oO5g3Q_4DGiEcBHfRbwvgNa8mYohq3U" 
            />
          </div>
          <span className="text-xl font-bold text-blue-900 dark:text-white tracking-tight font-headline">Smart League</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-blue-900 dark:text-blue-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors rounded-full transition-transform active:scale-95 duration-150 ease-in-out">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-12">
        {/* ── Hero Search ── */}
        <section className="space-y-6">
          <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-primary">Discover Excellence.</h1>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input 
              className="w-full pl-16 pr-8 py-5 rounded-full bg-surface-container-lowest border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-body-lg placeholder:text-outline-variant font-medium" 
              placeholder="Search schools, colleges, or top-tier students..." 
              type="text" 
            />
          </div>
        </section>

        {/* ── Browse Fields ── */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold font-headline text-on-surface">Browse Fields</h2>
            <span className="text-xs font-semibold uppercase tracking-wider font-inter text-primary underline underline-offset-4 cursor-pointer">View All Domains</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pt-2">
            {/* Sports */}
            <div className="flex-shrink-0 group cursor-pointer" onClick={() => navigate("/category/sports")}>
              <div className="w-32 h-44 rounded-3xl bg-secondary-container p-5 flex flex-col justify-between transition-transform group-hover:-translate-y-1">
                <span className="material-symbols-outlined text-on-secondary-container scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>sports_basketball</span>
                <span className="text-sm font-bold font-headline text-on-secondary-container">Sports</span>
              </div>
            </div>

            {/* Research */}
            <div className="flex-shrink-0 group cursor-pointer" onClick={() => navigate("/category/research")}>
              <div className="w-32 h-44 rounded-3xl bg-tertiary-container p-5 flex flex-col justify-between transition-transform group-hover:-translate-y-1">
                <span className="material-symbols-outlined text-on-tertiary-container scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
                <span className="text-sm font-bold font-headline text-on-tertiary-container">Research</span>
              </div>
            </div>

            {/* Tech */}
            <div className="flex-shrink-0 group cursor-pointer" onClick={() => navigate("/category/tech")}>
              <div className="w-32 h-44 rounded-3xl bg-primary-container p-5 flex flex-col justify-between transition-transform group-hover:-translate-y-1">
                <span className="material-symbols-outlined text-on-primary-container scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                <span className="text-sm font-bold font-headline text-on-primary-container">Tech</span>
              </div>
            </div>

            {/* Arts */}
            <div className="flex-shrink-0 group cursor-pointer" onClick={() => navigate("/category/arts")}>
              <div className="w-32 h-44 rounded-3xl bg-surface-container-highest p-5 flex flex-col justify-between transition-transform group-hover:-translate-y-1">
                <span className="material-symbols-outlined text-on-surface-variant scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                <span className="text-sm font-bold font-headline text-on-surface-variant">Arts</span>
              </div>
            </div>

            {/* Service */}
            <div className="flex-shrink-0 group cursor-pointer" onClick={() => navigate("/category/service")}>
              <div className="w-32 h-44 rounded-3xl bg-primary/5 p-5 flex flex-col justify-between border-2 border-primary/10 transition-transform group-hover:-translate-y-1">
                <span className="material-symbols-outlined text-primary scale-125" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_1</span>
                <span className="text-sm font-bold font-headline text-primary">Service</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Institutions Near You ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-headline text-on-surface">Institutions Near You</h2>
            <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 group relative overflow-hidden rounded-[2rem] bg-surface-container-low aspect-[16/9]">
              <img 
                alt="Campus" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnLryBCG2V5FghAMbZUxm85rpuc6pxDKysNRQHpPGDtpEMff5r82IoOOyqHKeT7aBs_DK1pdhqxIxbuIc4-3ObHHfSTd_adr-8tJntHfdiRIGtl7SWu09v8Vya1RAPyb2ebF6DbTIQej0HTW3YMsxG9ygsqpyCspuwoOc0-wh9FTc0b81osnv81okVTYtFsDGK3xTgm97y5n1XbHtw0s_WGknp6lYfKWUWCMv7381bHJlQ4h78UCnCEbGbWwxBPCK65oeW-6Nmoaw" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-sm mb-4">Elite Tier</span>
                <h3 className="text-3xl font-bold text-white font-headline">St. Lawrence Academy</h3>
                <p className="text-white/80 mt-2 max-w-md">Leading in inter-varsity debate and quantum research initiatives for 2024.</p>
                <div className="mt-6 flex gap-4">
                  <button className="bg-white text-primary px-6 py-2.5 rounded-full text-sm font-bold hover:bg-surface-container-high transition-colors">Apply Now</button>
                  <button className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/30 transition-colors">Explore Campus</button>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 group bg-surface-container-lowest rounded-[2rem] p-6 flex flex-col justify-between border border-outline-variant/10">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary scale-150" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
              </div>
              <div>
                <h4 className="text-xl font-bold font-headline text-on-surface">Nova Tech Institute</h4>
                <p className="text-on-surface-variant text-sm mt-1">2.4 miles away • Active Tech Hub</p>
                <div className="mt-4 flex -space-x-3">
                  <img alt="Student" className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACuwniGFIrKzf56bg23m-7BpA_RxuyDFiIgMnVe2hqz-cALk-QGBUAVCY_dGA_pk0TAALNfngT8icHlgHw2xrIQy7MgdJbq080IqIc4SlHZK5W50e6Es2XhTqD_WjZwBHnaTMwj5HhjCMnSzDlwBhTE0i5IiJBDyBDL1Wz5vaY8YQ4vqrs1qpFZCIVjUpciDG48mHPRab43dyIS64eOWq0Tb5jz02yb00UZavjXjCW8xAUdgMH84rsIfEcwvWjsUdkwt8j39o7ABI" />
                  <img alt="Student" className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUxfhjs1DROVu2IZEnC6roFZPj692XhtNUOg59ajYY_1QPhFevX99Oul5SZz4WDlQbYo7Pgacp_m1gv_DvMgwdbROeHxSWBpWHT5g8DHuERkazOZveDxsGcNnkwRHIPHQlf_M4rqbFdGcrelMhn_xqtZ9SCkLcqgK4rP9NRURwJwqICfuIfm1aJSXtkqAAmfmUSzXqYe6THjdk_wrp41_e3hZyw7d1DWzE-nqLVAaIKXejqipqG7uNBzw_O5cxMtT8S9wPu2F5Lgw" />
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold">+12</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 group bg-primary rounded-[2rem] p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined scale-125">map</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed">Local Focus</span>
              </div>
              <div className="mt-8">
                <h4 className="text-xl font-bold font-headline">Ridgewood Community</h4>
                <p className="text-white/60 text-sm mt-1">Join the ongoing urban gardening project this weekend.</p>
              </div>
            </div>

            <div className="md:col-span-8 rounded-[2rem] overflow-hidden relative group">
              <div className="absolute inset-0 bg-slate-200">
                <img 
                  alt="Map" 
                  className="w-full h-full object-cover grayscale opacity-50 contrast-125" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc7EusH7b2NDNzbVIW1LGGALzJ6mQM29gEehNdmA-Heh3DHho8l5eXXv3yWuc1z4WmyijEz1l3M4KTiRqEQ6xrUmycKK1SiXgNxVyPgtpxL1pm-4Tv78C_3OUigVQho8YJc41TH6FyUNMpzaCX_V95Fb6xk7lasIEFMFzoBDgfT0FyxMt837imhcsYFCpqlDyDLsNQomHkhNTY01mc-y3RlfvMQqhMnT4ubo76Fizz--0Ix_qJ4ZWEZcNPrYzNhI4vJ6TVLMoNVQg" 
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-effect bg-white/60 p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-white/40">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Live Network</p>
                    <p className="text-primary font-bold">14 Active Institutions Found</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Top Achievers ── */}
        <section className="space-y-8 pb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline text-on-surface">Top Achievers</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold">Global</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors">Local</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Achiever 01 */}
            <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-surface-container-low transition-colors group cursor-pointer">
              <span className="text-4xl font-headline font-extrabold text-outline-variant/40 group-hover:text-primary transition-colors">01</span>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-0.5">
                <img alt="Achiever" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMREiVOwyTfF5X2CdqwRf3imc9LZLzdW-mZoZ7fAx0E7QwjmQoDMP8zAbtSZ-fFZ3EHgKf_fNrBSSDnQZFCZKE-1DIbagQhZEMB-HphdMHikt-CI3decUWt75Dbso-lOxc-DYTP-TUyNHWVrzkViaz5xoGv86XF7uadNqZbM5o9K3vrgPfSoGwFaRQ0QvT4EmUWro1wD1UpbBrbyDzXCc4s1I0Fg2ule4_Ug7JaTObiToah8njgUScW-NxI7EmJQfemuKP053CUgA" />
              </div>
              <div className="flex-grow">
                <h5 className="text-lg font-bold font-headline text-primary">Julian Thorne</h5>
                <p className="text-sm text-on-surface-variant font-medium">Mathematics & Physics • 4,800 XP</p>
              </div>
              <div className="px-3 py-1 rounded-sm bg-tertiary-container/20 text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider">Research</div>
            </div>

            {/* Achiever 02 */}
            <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-surface-container-low transition-colors group cursor-pointer">
              <span className="text-4xl font-headline font-extrabold text-outline-variant/40 group-hover:text-primary transition-colors">02</span>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-0.5">
                <img alt="Achiever" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfz8X9kA9JE_NpLA267XPUpDoroCUxIfKJQmpw3vwLN2Oqe_d6E0KwFyx8nNVINuD-qqveSp76pub4NE9YIA-fEqscM32qOHIG5p_i3kXDHONe5HhuMgngwF8yCbdY60cZYXzFU-5U3fwRRndNerauFhbDqVNLyqMub-H4N2EOBqo4ObmM4Yve6vVMn_9tN8RMAcG9f7TINm0A1RpRa0QivzV3sqYX31k-bHPyX-zmC2ldtfFfKpKJoeYZrKCtyDYtdUQldyePZWU" />
              </div>
              <div className="flex-grow">
                <h5 className="text-lg font-bold font-headline text-primary">Elena Rodriguez</h5>
                <p className="text-sm text-on-surface-variant font-medium">Visual Arts & UX • 4,650 XP</p>
              </div>
              <div className="px-3 py-1 rounded-sm bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Arts</div>
            </div>

            {/* Achiever 03 */}
            <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-surface-container-low transition-colors group cursor-pointer">
              <span className="text-4xl font-headline font-extrabold text-outline-variant/40 group-hover:text-primary transition-colors">03</span>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-0.5">
                <img alt="Achiever" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByNROAGLEJRnapQjjeTO46Rx0-5Cp0q_EPSyhb6mTnT158ovV2QZ9eRyAY93hgjLCCzL1axESD8rKYtLggTVegeVeGlI2egRRpKSlnRqgireg1rfi7SX8FsZcKGmux0y7Q0R5c1lCfArrtyUFLySB99cB2WnKEV3SHDvJZ64ECHlx5UxGTpwja9GfGTcbDiBF875RrVtaz-MI1ASfyRCcKa42dxun-3BSoIZ8qVmp2L8CX8DAKRzePzxDDVk5bhJmREGNmnu5ickI" />
              </div>
              <div className="flex-grow">
                <h5 className="text-lg font-bold font-headline text-primary">Marcus Vane</h5>
                <p className="text-sm text-on-surface-variant font-medium">Track & Field • 4,420 XP</p>
              </div>
              <div className="px-3 py-1 rounded-sm bg-secondary-container/20 text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">Sports</div>
            </div>

            {/* Achiever 04 */}
            <div className="flex items-center gap-6 p-4 rounded-3xl hover:bg-surface-container-low transition-colors group cursor-pointer">
              <span className="text-4xl font-headline font-extrabold text-outline-variant/40 group-hover:text-primary transition-colors">04</span>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all p-0.5">
                <img alt="Achiever" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoZ6oiYW_dO1IpZSLWdRzhvmxnHBBhujFutHHXxKXTqTuVhNFEJeGjhDtQ0cbv_DBNg7I71L1LLXHVxr-MNrK71Kgx9FKIz6qrOLrA4e1fC0T2erTbPucUhaeJVuubHuwa9EBef2Qg5gtanpErHuvlaZIu0tnoSVWWNeu_tteITr40UkW1YkLxA5RjWzBPT14CLwnSjoxiYcHERWXYucsbHZhsprBTQ9HOJk2qpcFwTeEb9Jn1_8XJpFPN8D5H0gaIVVWSeO9z4LE" />
              </div>
              <div className="flex-grow">
                <h5 className="text-lg font-bold font-headline text-primary">Sophia Chen</h5>
                <p className="text-sm text-on-surface-variant font-medium">Open Source Dev • 4,100 XP</p>
              </div>
              <div className="px-3 py-1 rounded-sm bg-primary-container/10 text-on-primary-container text-[10px] font-bold uppercase tracking-wider">Tech</div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 z-50 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)] tonal-shift surface-container-low border-t border-white/10">
        <Link to="/feed" className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-2 hover:text-blue-700 dark:hover:text-amber-200 transition-colors">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Home</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center justify-center bg-blue-900 dark:bg-amber-400 text-white dark:text-blue-950 rounded-full px-5 py-2 scale-110 active:scale-90 duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-0.5">Explore</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-2 hover:text-blue-700 dark:hover:text-amber-200 transition-colors">
          <span className="material-symbols-outlined">event</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Events</span>
        </Link>
        <Link to="/notifications" className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 px-4 py-2 hover:text-blue-700 dark:hover:text-amber-200 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[11px] font-medium tracking-tight font-inter mt-1">Activity</span>
        </Link>
      </nav>
    </div>
  );
};
