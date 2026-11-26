import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  User,
  LogOut,
  MapPin,
  ExternalLink,
  Bell,
  Moon,
  Sun,
  Wrench,
  Clock,
  ShieldCheck,
  Play,
  Phone,
  Users,
} from 'lucide-react';
import { buildRealtimeStats, getReportOfficerUsernames } from '../../data/adminMockData';

const TIMEFRAME_OPTIONS = [
  { id: '30m', label: '30 Menit' },
  { id: '1h', label: '1 Jam' },
  { id: '1d', label: 'Per Hari' },
  { id: '1mo', label: 'Per Bulan' },
];

export default function OfficerDashboard({ user, users = [], reports, setReports, onLogout }) {
  const [menu, setMenu] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('1d');
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const topTabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'tugas', label: 'Tugas Saya' },
    { id: 'selesai', label: 'Riwayat Selesai' },
    { id: 'profil', label: 'Profil Petugas' },
  ];

  const dockItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tugas', label: 'Tugas Saya', icon: ClipboardList },
    { id: 'selesai', label: 'Selesai', icon: CheckCircle2 },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  const myTasks = reports.filter((r) =>
    getReportOfficerUsernames(r).includes(user.username)
  );
  const activeTasks = myTasks.filter((r) => r.status !== 'Laporan Selesai');
  const pendingTasks = myTasks.filter((r) => r.status === 'Ditugaskan');
  const inProgressTasks = myTasks.filter((r) => r.status === 'Dalam Penanganan');
  const doneTasks = myTasks.filter((r) => r.status === 'Laporan Selesai');

  const officerRealtimeStats = buildRealtimeStats(reports, chartTimeframe, nowTick, user.username);
  const liveClockLabel = new Date(nowTick).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const completionPercent =
    myTasks.length > 0 ? Math.round((doneTasks.length / myTasks.length) * 100) : 100;

  const updateTaskStatus = (id, status) => {
    const nowIso = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              updatedAt: nowIso,
              ...(status === 'Laporan Selesai' ? { completedAt: nowIso } : {}),
            }
          : r
      )
    );
    setNowTick(Date.now());
  };

  const getCoWorkers = (report) => {
    const allAssigned = getReportOfficerUsernames(report).filter(
      (uname) => uname !== user.username
    );
    return allAssigned.map((uname) => {
      const found = users.find((u) => u.username === uname);
      return found ? found.name : uname;
    });
  };

  const pageBg = darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f4f7fb] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#141b29] border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/70 text-slate-900 bento-3d';
  const subCardBg = darkMode ? 'bg-[#1c2536] border-slate-700/70' : 'bg-[#f8fafc] border-slate-200/70';
  const mutedText = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 md:pb-10 ${pageBg}`}>
      {/* TOP FLOATING PILL NAVBAR */}
      <header className="sticky top-0 z-40 pt-4 px-4 sm:px-8">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setMenu('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bento-blue-3d text-white font-extrabold flex items-center justify-center text-sm">
              SF
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Sigap<span className="text-blue-600">Fasum</span>
            </span>
          </button>

          {/* Center Capsule Tabs */}
          <nav
            className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border shadow-sm backdrop-blur-md ${
              darkMode ? 'bg-[#141b29]/90 border-slate-800' : 'bg-white/95 border-slate-200/80'
            }`}
          >
            {topTabs.map((t) => {
              const active = menu === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMenu(t.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? darkMode
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#0f172a] text-white shadow-md'
                      : `${mutedText} hover:text-blue-600`
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMenu('tugas')}
              title="Tugas Aktif Lapangan"
              className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                darkMode ? 'bg-[#141b29] border-slate-800 text-slate-300' : 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
              }`}
            >
              <Bell className="w-4 h-4" />
              {activeTasks.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Ubah Tema Terang / Gelap"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                darkMode ? 'bg-[#141b29] border-slate-800 text-amber-400' : 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div
              className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border ${
                darkMode ? 'bg-[#141b29] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="w-7 h-7 rounded-full bento-blue-3d text-white text-xs font-extrabold flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-extrabold">{user.name}</p>
                <p className="text-[10px] font-bold text-blue-600">Petugas</p>
              </div>
              <button
                onClick={onLogout}
                title="Keluar Akun"
                className="ml-1 p-1 rounded-full text-slate-400 hover:text-red-500 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY WRAPPER WITH LEFT FLOATING ICON DOCK */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 pt-6 flex gap-6 items-start">
        <aside
          className={`hidden lg:flex flex-col items-center justify-between py-4 px-2.5 rounded-[28px] border sticky top-24 min-h-[430px] shrink-0 ${
            darkMode ? 'bg-[#141b29] border-slate-800' : 'bg-white border-slate-200/80 bento-3d'
          }`}
        >
          <div className="flex flex-col gap-3">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const active = menu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setMenu(item.id)}
                  title={item.label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    active
                      ? 'bento-blue-3d text-white scale-105'
                      : `${mutedText} hover:bg-blue-600/10 hover:text-blue-600`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          <button
            onClick={onLogout}
            title="Keluar Sistem"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>

        {/* MAIN BENTO CONTENT */}
        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Selamat bertugas, {user.name}
              </h1>
              <p className={`text-xs sm:text-sm mt-1 ${mutedText}`}>{user.unit}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600/10 text-blue-600 self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5" /> Petugas Lapangan ({user.id})
            </span>
          </div>

          {/* VIEW 1: OVERVIEW BENTO GRID */}
          {menu === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Kolom Kiri */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  <div className={`rounded-[28px] border p-6 flex-1 flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${mutedText}`}>Total Tugas Lapangan</span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600/10 text-blue-600">
                          Petugas
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2.5 mt-3">
                        <span className="text-4xl font-extrabold tracking-tight">{myTasks.length}</span>
                        <span className={`text-xs font-semibold ${mutedText}`}>Penugasan</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mt-6">
                      <button
                        onClick={() => setMenu('tugas')}
                        className="py-3 px-4 rounded-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Tugas Aktif
                      </button>
                      <button
                        onClick={() => setMenu('selesai')}
                        className={`py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${subCardBg}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </button>
                    </div>
                  </div>

                  {/* Progress Penyelesaian Tugas */}
                  <div className={`rounded-[28px] border p-6 space-y-3 ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">Progres Penyelesaian</span>
                      <span className="text-xs font-extrabold text-blue-600">{completionPercent}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200/70 dark:bg-slate-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bento-blue-3d transition-all duration-500"
                        style={{ width: `${Math.max(completionPercent, 14)}%` }}
                      />
                    </div>
                    <div className={`flex justify-between text-[11px] font-semibold ${mutedText}`}>
                      <span>{doneTasks.length} Tugas Tuntas</span>
                      <span>Dari {myTasks.length} Total Tugas</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Tengah: Grid 2x2 Bento */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setMenu('tugas')}
                    className="bento-blue-3d rounded-[28px] p-5 text-white flex flex-col justify-between cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15 blur-md" />
                    <div className="flex items-center justify-between relative">
                      <span className="text-xs font-bold text-white/90">Tugas Baru</span>
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="mt-6 relative">
                      <p className="text-3xl font-extrabold">{pendingTasks.length}</p>
                      <p className="text-[11px] text-blue-100 mt-1 font-medium">Siap dikerjakan</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setMenu('tugas')}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Dikerjakan</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-extrabold">{inProgressTasks.length}</p>
                      <p className="text-[11px] text-amber-500 mt-1 font-bold">Sedang proses</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setMenu('selesai')}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Selesai</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-extrabold">{doneTasks.length}</p>
                      <p className="text-[11px] text-emerald-500 mt-1 font-bold">Laporan tuntas</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setMenu('profil')}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Kode Tim</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-xl font-extrabold">{user.id}</p>
                      <p className="text-[11px] text-blue-600 mt-1 font-bold">@{user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Grafik Kinerja Realtime */}
                <div className={`lg:col-span-4 rounded-[28px] border p-6 flex flex-col justify-between ${cardBg}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold">Performa Lapangan</h3>
                        <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                          Tugas diterima & diselesaikan
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live {liveClockLabel.slice(0, 5)}
                      </span>
                    </div>

                    <div className={`grid grid-cols-4 gap-1 p-1 rounded-full border ${subCardBg}`}>
                      {TIMEFRAME_OPTIONS.map((opt) => {
                        const active = chartTimeframe === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setChartTimeframe(opt.id);
                              setNowTick(Date.now());
                            }}
                            className={`py-1 px-2 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                              active
                                ? 'bento-blue-3d text-white shadow-xs'
                                : `${mutedText} hover:text-blue-600`
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 items-end h-40 pt-5">
                    {officerRealtimeStats.items.map((item) => (
                      <div
                        key={item.fullLabel}
                        className="flex flex-col items-center gap-1.5 h-full justify-end group"
                        title={`${item.fullLabel} • Tugas: ${item.masuk}, Selesai: ${item.selesai}`}
                      >
                        <span className="text-[9px] font-extrabold text-blue-600 opacity-80 group-hover:opacity-100">
                          {item.selesai}
                        </span>
                        <div className="w-full flex items-end justify-center h-24">
                          <div
                            style={{ height: `${item.selesaiHeight}%` }}
                            className={`w-3.5 rounded-full transition-all duration-500 group-hover:scale-y-105 ${
                              item.selesai > 0 ? 'bento-blue-3d' : 'bg-blue-600/20'
                            }`}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${mutedText}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIST TUGAS AKTIF */}
          {(menu === 'dashboard' || menu === 'tugas') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold">Daftar Tugas Lapangan ({user.name})</h2>
                <span className={`text-xs font-bold ${mutedText}`}>
                  {activeTasks.length} tugas perlu ditangani
                </span>
              </div>

              {activeTasks.length === 0 ? (
                <div className={`rounded-[28px] border p-8 text-center text-xs ${cardBg} ${mutedText}`}>
                  Semua tugas lapangan sudah selesai dikerjakan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeTasks.map((task) => {
                    const coWorkers = getCoWorkers(task);
                    return (
                      <div
                        key={task.id}
                        className={`rounded-[28px] border p-5 flex flex-col justify-between gap-4 ${cardBg}`}
                      >
                        <div>
                          <img
                            src={task.image}
                            alt={task.title}
                            className="w-full h-40 object-cover rounded-2xl mb-3.5"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-blue-600">{task.id}</span>
                            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/10 text-blue-600">
                              {task.status}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold mt-2">{task.title}</h3>
                          <p className={`text-xs mt-1 line-clamp-2 ${mutedText}`}>{task.description}</p>

                          {coWorkers.length > 0 && (
                            <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 text-[11px] font-bold flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">Tim bersama: {coWorkers.join(', ')}</span>
                            </div>
                          )}

                          <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800 space-y-1.5">
                            <p className={`text-xs flex items-center gap-1.5 ${mutedText}`}>
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="truncate">{task.location}</span>
                            </p>
                            {task.mapUrl && (
                              <a
                                href={task.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                              >
                                Buka Titik Google Maps <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          {task.status === 'Ditugaskan' ? (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'Dalam Penanganan')}
                              className="w-full py-3 rounded-full bento-blue-3d text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" /> Mulai Kerjakan
                            </button>
                          ) : (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'Laporan Selesai')}
                              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: RIWAYAT TUGAS SELESAI */}
          {menu === 'selesai' && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold">Riwayat Tugas Selesai ({user.name})</h2>
              {doneTasks.length === 0 ? (
                <div className={`rounded-[28px] border p-8 text-center text-xs ${cardBg} ${mutedText}`}>
                  Belum ada riwayat tugas yang diselesaikan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {doneTasks.map((task) => (
                    <div key={task.id} className={`rounded-[28px] border p-5 space-y-2.5 ${cardBg}`}>
                      <img src={task.image} alt={task.title} className="w-full h-40 object-cover rounded-2xl" />
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-blue-600">{task.id}</span>
                        <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500">
                          Laporan Selesai
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold">{task.title}</h3>
                      <p className={`text-xs ${mutedText}`}>{task.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: PROFIL PETUGAS */}
          {menu === 'profil' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5">
                <div className="bento-dark-3d rounded-[28px] p-7 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-blue-600/30 blur-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-blue-300">
                      KARTU TUGAS LAPANGAN
                    </span>
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/60">ID Personel Kabupaten Kudus</p>
                    <p className="font-mono text-xl font-extrabold tracking-widest mt-1">
                      {user.id} • KUDUS
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
                    <div>
                      <p className="text-[10px] text-white/50">Nama Petugas</p>
                      <p className="font-bold">{user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/50">Peran</p>
                      <p className="font-bold text-blue-400">Petugas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-7 rounded-[28px] border p-7 space-y-4 ${cardBg}`}>
                <h2 className="text-lg font-extrabold">Informasi Akun & Penempatan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-4 rounded-2xl border ${subCardBg}`}>
                    <p className={mutedText}>Nama Lengkap</p>
                    <p className="font-extrabold text-sm mt-0.5">{user.name}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${subCardBg}`}>
                    <p className={mutedText}>Username Login</p>
                    <p className="font-mono font-extrabold text-sm text-blue-600 mt-0.5">@{user.username}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${subCardBg}`}>
                    <p className={mutedText}>Unit / Divisi Lapangan</p>
                    <p className="font-extrabold text-sm mt-0.5">{user.unit}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${subCardBg}`}>
                    <p className={mutedText}>Nomor Kontak Dinas</p>
                    <p className="font-extrabold text-sm mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> {user.phone}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={onLogout}
                    className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Keluar dari Akun
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FLOATING BOTTOM DOCK (MOBILE) */}
      <nav
        className={`md:hidden fixed bottom-4 left-4 right-4 rounded-full border shadow-xl px-2 py-2 flex items-center justify-around z-40 backdrop-blur-md ${
          darkMode ? 'bg-[#141b29]/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const active = menu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMenu(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold transition ${
                active ? 'bento-blue-3d text-white' : mutedText
              }`}
            >
              <Icon className="w-4 h-4" />
              {active && <span>{item.label.split(' ')[0]}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}