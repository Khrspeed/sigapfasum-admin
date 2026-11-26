import { useRef, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Users,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  LogOut,
  Search,
  UserCheck,
  XCircle,
  ExternalLink,
  Bell,
  Moon,
  Sun,
  ArrowUpRight,
  SlidersHorizontal,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { INITIAL_ADMIN_REPORTS, OFFICERS } from '../../data/adminMockData';

const WEEKLY_CHART = [
  { day: 'Sen', total: 42, selesai: 30 },
  { day: 'Sel', total: 68, selesai: 52 },
  { day: 'Rab', total: 55, selesai: 44 },
  { day: 'Kam', total: 86, selesai: 70 },
  { day: 'Jum', total: 62, selesai: 48 },
  { day: 'Sab', total: 74, selesai: 60 },
  { day: 'Min', total: 48, selesai: 39 },
];

export default function AdminDashboard({ user, reports, setReports, onLogout }) {
  const [menu, setMenu] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOfficerUsername, setSelectedOfficerUsername] = useState(OFFICERS[0].username);
  const [backupNotice, setBackupNotice] = useState(null);

  // Pengaturan cepat pada tab Kelola (mirip panel Card Controls di video)
  const [controls, setControls] = useState({
    gpsStrict: true,
    autoNotifOfficer: true,
    publicLiveFeed: true,
    antiSpamFilter: true,
  });

  const fileInputRef = useRef(null);

  // Menu Top Pill Bar (5 tab utama seperti di video)
  const topTabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'laporan', label: 'Laporan' },
    { id: 'kelola', label: 'Kelola' },
    { id: 'petugas', label: 'Petugas 1–5' },
    { id: 'backup', label: 'Backup Data' },
  ];

  // Dock Ikon Vertikal Kiri
  const dockItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'laporan', label: 'Semua Laporan', icon: FileText },
    { id: 'kelola', label: 'Kontrol & Tugas', icon: SlidersHorizontal },
    { id: 'petugas', label: 'Tim Petugas', icon: Users },
    { id: 'backup', label: 'Backup Data', icon: Database },
  ];

  const stats = {
    total: reports.length,
    verifikasi: reports.filter((r) => r.status === 'Menunggu Verifikasi').length,
    penanganan: reports.filter((r) => r.status === 'Dalam Penanganan' || r.status === 'Ditugaskan').length,
    selesai: reports.filter((r) => r.status === 'Laporan Selesai').length,
  };

  const completionPercent = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

  const handleAssign = (reportId) => {
    const officer = OFFICERS.find((o) => o.username === selectedOfficerUsername);
    if (!officer) return;

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'Ditugaskan',
              assignedToUsername: officer.username,
              assignedToName: `${officer.label} - ${officer.name}`,
            }
          : r
      )
    );
    setSelectedReport(null);
  };

  const handleReject = (reportId) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'Ditolak' } : r))
    );
    setSelectedReport(null);
  };

  // Fungsi Backup JSON
  const handleDownloadJsonBackup = () => {
    const payload = {
      app: 'SigapFasum Kabupaten Kudus',
      exportedAt: new Date().toISOString(),
      exportedBy: user.name,
      totalReports: reports.length,
      reports,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-sigapfasum-kudus-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupNotice({
      type: 'success',
      text: `Backup JSON berhasil diunduh (${reports.length} tiket laporan tersimpan).`,
    });
  };

  // Fungsi Ekspor Excel CSV
  const handleExportCsv = () => {
    const headers = [
      'ID Tiket',
      'Judul Kerusakan',
      'Kategori',
      'Lokasi',
      'Status',
      'Petugas Ditugaskan',
      'Pelapor',
      'Tanggal',
      'Link Google Maps',
    ];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = reports.map((r) => [
      escapeCsv(r.id),
      escapeCsv(r.title),
      escapeCsv(r.category),
      escapeCsv(r.location),
      escapeCsv(r.status),
      escapeCsv(r.assignedToName || 'Belum ditugaskan'),
      escapeCsv(r.reporter || '-'),
      escapeCsv(r.createdAt || '-'),
      escapeCsv(r.mapUrl || '-'),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap-laporan-sigapfasum-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupNotice({
      type: 'success',
      text: 'File rekap CSV berhasil diunduh dan siap dibuka di Microsoft Excel.',
    });
  };

  // Fungsi Restore JSON
  const handleRestoreJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const restoredList = Array.isArray(parsed) ? parsed : parsed.reports;
        if (!Array.isArray(restoredList) || !restoredList.every((item) => item.id && item.title)) {
          throw new Error('Format tidak valid');
        }
        setReports(restoredList);
        setBackupNotice({
          type: 'success',
          text: `Data berhasil dipulihkan! Sebanyak ${restoredList.length} laporan dimuat kembali.`,
        });
      } catch {
        setBackupNotice({
          type: 'error',
          text: 'Gagal memulihkan data. Pastikan file berformat .json hasil backup SigapFasum.',
        });
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Reset Data
  const handleResetDefault = () => {
    if (!window.confirm('Kembalikan seluruh data laporan ke data awal simulasi?')) return;
    setReports(INITIAL_ADMIN_REPORTS);
    setBackupNotice({ type: 'success', text: 'Data berhasil dikembalikan ke pengaturan awal.' });
  };

  const filteredReports = reports.filter((r) => {
    const matchText =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'verifikasi') return matchText && r.status === 'Menunggu Verifikasi';
    if (statusFilter === 'penanganan') {
      return matchText && (r.status === 'Dalam Penanganan' || r.status === 'Ditugaskan');
    }
    if (statusFilter === 'selesai') return matchText && r.status === 'Laporan Selesai';
    return matchText;
  });

  // Kelas tema dinamis (Light Mode default sesuai video + opsi Dark Mode)
  const pageBg = darkMode ? 'bg-[#0f1115] text-slate-100' : 'bg-[#f5f6f8] text-slate-900';
  const cardBg = darkMode
    ? 'bg-[#181b21] border-slate-800 text-slate-100'
    : 'bg-white border-slate-200/70 text-slate-900 bento-3d';
  const subCardBg = darkMode ? 'bg-[#20242c] border-slate-700/70' : 'bg-[#f8f9fb] border-slate-200/60';
  const mutedText = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 md:pb-10 ${pageBg}`}>
      {/* TOP FLOATING PILL NAVBAR */}
      <header className="sticky top-0 z-40 pt-4 px-4 sm:px-8">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <button
            onClick={() => setMenu('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bento-orange-3d text-white font-extrabold flex items-center justify-center text-sm">
              SF
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Sigap<span className="text-[#f95724]">Fasum</span>
            </span>
          </button>

          {/* Center Capsule Tabs (Seperti Video) */}
          <nav
            className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border shadow-sm backdrop-blur-md ${
              darkMode ? 'bg-[#181b21]/90 border-slate-800' : 'bg-white/95 border-slate-200/80'
            }`}
          >
            {topTabs.map((t) => {
              const active = menu === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setMenu(t.id);
                    setBackupNotice(null);
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? darkMode
                        ? 'bg-[#f95724] text-white shadow-md'
                        : 'bg-[#181a1f] text-white shadow-md'
                      : `${mutedText} hover:text-orange-500`
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls (Notifikasi, Dark Mode Toggle, Profil Admin) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setMenu('laporan');
                setStatusFilter('verifikasi');
              }}
              title="Laporan Menunggu Verifikasi"
              className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                darkMode ? 'bg-[#181b21] border-slate-800 text-slate-300' : 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
              }`}
            >
              <Bell className="w-4 h-4" />
              {stats.verifikasi > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#f95724]" />
              )}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Ubah Tema Terang / Gelap"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                darkMode ? 'bg-[#181b21] border-slate-800 text-amber-400' : 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div
              className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border ${
                darkMode ? 'bg-[#181b21] border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="w-7 h-7 rounded-full bento-orange-3d text-white text-xs font-extrabold flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-extrabold">{user.name}</p>
                <p className={`text-[10px] ${mutedText}`}>@{user.username}</p>
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
        {/* Left Floating Vertical Dock (Desktop) */}
        <aside
          className={`hidden lg:flex flex-col items-center justify-between py-4 px-2.5 rounded-[28px] border sticky top-24 min-h-[460px] shrink-0 ${
            darkMode ? 'bg-[#181b21] border-slate-800' : 'bg-white border-slate-200/80 bento-3d'
          }`}
        >
          <div className="flex flex-col gap-3">
            {dockItems.map((item) => {
              const Icon = item.icon;
              const active = menu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMenu(item.id);
                    setBackupNotice(null);
                  }}
                  title={item.label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    active
                      ? 'bento-orange-3d text-white scale-105'
                      : `${mutedText} hover:bg-orange-500/10 hover:text-[#f95724]`
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
          {/* Greeting Header (Mirip "Good morning, Code XR") */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Selamat bertugas, {user.name}
              </h1>
              <p className={`text-xs sm:text-sm mt-1 ${mutedText}`}>
                Pantau pengaduan fasilitas umum & distribusi tugas lapangan Kabupaten Kudus.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-[#f95724] self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5" /> Kabupaten Kudus • Live Panel
            </span>
          </div>

          {/* ========================================================= */}
          {/* VIEW 1: OVERVIEW (BENTO GRID 3D SEPERTI VIDEO)            */}
          {/* ========================================================= */}
          {menu === 'dashboard' && (
            <div className="space-y-6">
              {/* Row 1: 3-Column Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Kolom Kiri (4 cols): Total Laporan + Quick Action + Progress Bar */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  <div className={`rounded-[28px] border p-6 flex-1 flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${mutedText}`}>Total Laporan Warga</span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500">
                          Kudus Aktif
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2.5 mt-3">
                        <span className="text-4xl font-extrabold tracking-tight">{stats.total}</span>
                        <span className={`text-xs font-semibold ${mutedText}`}>Tiket Masuk</span>
                      </div>
                    </div>

                    {/* Dua Tombol Kapsul 3D (Hitam & Terang seperti Deposit / Request di video) */}
                    <div className="grid grid-cols-2 gap-2.5 mt-6">
                      <button
                        onClick={() => {
                          setMenu('laporan');
                          setStatusFilter('verifikasi');
                        }}
                        className="py-3 px-4 rounded-full bg-[#181a1f] hover:bg-[#f95724] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" /> Verifikasi
                      </button>
                      <button
                        onClick={() => setMenu('backup')}
                        className={`py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${subCardBg}`}
                      >
                        <Download className="w-3.5 h-3.5" /> Backup
                      </button>
                    </div>
                  </div>

                  {/* Card Progress Penyelesaian (Mirip Monthly Spending Limit di video) */}
                  <div className={`rounded-[28px] border p-6 space-y-3 ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">Target Penyelesaian</span>
                      <span className="text-xs font-extrabold text-[#f95724]">{completionPercent}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200/70 dark:bg-slate-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bento-orange-3d transition-all duration-500"
                        style={{ width: `${Math.max(completionPercent, 12)}%` }}
                      />
                    </div>
                    <div className={`flex justify-between text-[11px] font-semibold ${mutedText}`}>
                      <span>{stats.selesai} Laporan Selesai</span>
                      <span>Dari {stats.total} Total Tiket</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Tengah (4 cols): Grid 2x2 Bento dengan Kartu Utama 3D Coral-Orange */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                  {/* Kartu Unggulan 3D Oranye-Koral (Seperti Kartu "$390" di video) */}
                  <div
                    onClick={() => {
                      setMenu('laporan');
                      setStatusFilter('verifikasi');
                    }}
                    className="bento-orange-3d rounded-[28px] p-5 text-white flex flex-col justify-between cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15 blur-md" />
                    <div className="flex items-center justify-between relative">
                      <span className="text-xs font-bold text-white/90">Verifikasi</span>
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="mt-6 relative">
                      <p className="text-3xl font-extrabold">{stats.verifikasi}</p>
                      <p className="text-[11px] text-white/85 mt-1 font-medium">Perlu dicek admin</p>
                    </div>
                  </div>

                  {/* Kartu Putih 3D #2: Dalam Penanganan */}
                  <div
                    onClick={() => {
                      setMenu('laporan');
                      setStatusFilter('penanganan');
                    }}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Ditangani</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-extrabold">{stats.penanganan}</p>
                      <p className="text-[11px] text-amber-500 mt-1 font-bold">Sedang dikerjakan</p>
                    </div>
                  </div>

                  {/* Kartu Putih 3D #3: Laporan Selesai */}
                  <div
                    onClick={() => {
                      setMenu('laporan');
                      setStatusFilter('selesai');
                    }}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Selesai</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-extrabold">{stats.selesai}</p>
                      <p className="text-[11px] text-emerald-500 mt-1 font-bold">Tuntas lapangan</p>
                    </div>
                  </div>

                  {/* Kartu Putih 3D #4: Tim Petugas */}
                  <div
                    onClick={() => setMenu('petugas')}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Petugas</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-extrabold">{OFFICERS.length}</p>
                      <p className="text-[11px] text-blue-500 mt-1 font-bold">Tim Lapangan Kudus</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan (4 cols): Grafik Batang Mingguan (Mirip Total Income Chart di video) */}
                <div className={`lg:col-span-4 rounded-[28px] border p-6 flex flex-col justify-between ${cardBg}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold">Statistik Penanganan</h3>
                      <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                        Perbandingan laporan masuk & selesai
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${subCardBg}`}>
                      Minggu Ini
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-bold mt-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f95724]" /> Laporan Masuk
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${darkMode ? 'bg-slate-400' : 'bg-slate-800'}`} /> Selesai
                    </span>
                  </div>

                  {/* Bar Chart Interaktif */}
                  <div className="grid grid-cols-7 gap-2.5 items-end h-40 pt-6">
                    {WEEKLY_CHART.map((item) => (
                      <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-1 h-28">
                          <div
                            style={{ height: `${item.total}%` }}
                            className="w-2.5 rounded-full bento-orange-3d transition-all duration-300 group-hover:scale-y-105"
                            title={`${item.day}: ${item.total} masuk`}
                          />
                          <div
                            style={{ height: `${item.selesai}%` }}
                            className={`w-2.5 rounded-full transition-all duration-300 ${
                              darkMode ? 'bg-slate-500' : 'bg-[#181a1f]'
                            }`}
                            title={`${item.day}: ${item.selesai} selesai`}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${mutedText}`}>{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Recent Activities / Laporan Terbaru (Mirip tabel bawah di video) */}
              <div className={`rounded-[28px] border p-6 space-y-4 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold">Aktivitas Laporan Warga Terbaru</h3>
                    <p className={`text-xs ${mutedText}`}>
                      Klik tombol Kelola untuk memverifikasi atau menugaskan Petugas 1–5.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Cari tiket atau lokasi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-full border text-xs focus:outline-none focus:ring-2 focus:ring-[#f95724] ${subCardBg}`}
                      />
                    </div>
                    <button
                      onClick={() => setMenu('laporan')}
                      className="px-4 py-2 rounded-full bg-[#181a1f] text-white text-xs font-bold hover:bg-[#f95724] transition cursor-pointer shrink-0"
                    >
                      Semua
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[11px] uppercase ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                        <th className="py-3 px-2">Tiket</th>
                        <th className="py-3 px-2">Kerusakan & Lokasi</th>
                        <th className="py-3 px-2">Petugas</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                      {filteredReports.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-orange-500/5 transition">
                          <td className="py-3.5 px-2 font-extrabold text-[#f95724]">{item.id}</td>
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                              />
                              <div>
                                <p className="font-bold">{item.title}</p>
                                <div className={`flex items-center gap-2 text-[11px] ${mutedText}`}>
                                  <span>{item.location}</span>
                                  {item.mapUrl && (
                                    <a
                                      href={item.mapUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#f95724] font-bold hover:underline inline-flex items-center gap-0.5"
                                    >
                                      Maps <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 font-semibold">
                            {item.assignedToName || <span className={`italic ${mutedText}`}>Belum ditugaskan</span>}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-[#f95724]">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => {
                                setSelectedReport(item);
                                setSelectedOfficerUsername(item.assignedToUsername || OFFICERS[0].username);
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-[#181a1f] hover:bg-[#f95724] text-white font-bold transition cursor-pointer"
                            >
                              Kelola
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: DAFTAR LENGKAP LAPORAN                            */}
          {/* ========================================================= */}
          {menu === 'laporan' && (
            <div className={`rounded-[28px] border p-6 space-y-5 ${cardBg}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'semua', label: 'Semua' },
                    { id: 'verifikasi', label: 'Verifikasi' },
                    { id: 'penanganan', label: 'Penanganan' },
                    { id: 'selesai', label: 'Selesai' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        statusFilter === f.id
                          ? 'bento-orange-3d text-white'
                          : `${subCardBg} ${mutedText}`
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari ID tiket, judul, atau lokasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-full border text-xs focus:outline-none focus:ring-2 focus:ring-[#f95724] ${subCardBg}`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                      <th className="py-3 px-2">Tiket</th>
                      <th className="py-3 px-2">Judul & Lokasi</th>
                      <th className="py-3 px-2">Pelapor</th>
                      <th className="py-3 px-2">Petugas</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {filteredReports.map((item) => (
                      <tr key={item.id} className="hover:bg-orange-500/5">
                        <td className="py-3.5 px-2 font-extrabold text-[#f95724]">{item.id}</td>
                        <td className="py-3.5 px-2">
                          <p className="font-bold">{item.title}</p>
                          <div className={`flex items-center gap-2 text-[11px] ${mutedText}`}>
                            <span>{item.location}</span>
                            {item.mapUrl && (
                              <a
                                href={item.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#f95724] font-bold hover:underline inline-flex items-center gap-0.5"
                              >
                                Maps <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className={`py-3.5 px-2 ${mutedText}`}>{item.reporter || 'Warga Kudus'}</td>
                        <td className="py-3.5 px-2 font-semibold">
                          {item.assignedToName || <span className={`italic ${mutedText}`}>Belum ditugaskan</span>}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-[#f95724]">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => {
                              setSelectedReport(item);
                              setSelectedOfficerUsername(item.assignedToUsername || OFFICERS[0].username);
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#181a1f] hover:bg-[#f95724] text-white font-bold transition cursor-pointer"
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: KELOLA & KONTROL (MIRIP "MANAGE" DARK CARD VIDEO) */}
          {/* ========================================================= */}
          {menu === 'kelola' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Kartu Gelap 3D (Mirip Your Cards di frame Manage video) */}
              <div className={`lg:col-span-5 rounded-[28px] border p-6 space-y-5 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold">Kartu Komando Dinas</h3>
                  <span className="text-[11px] font-bold text-[#f95724]">Kudus Command</span>
                </div>

                <div className="bento-dark-3d rounded-[24px] p-6 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-[#f95724]/25 blur-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-white/80">
                      SIGAPFASUM KUDUS
                    </span>
                    <ShieldCheck className="w-5 h-5 text-[#f95724]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/60">Kode Otoritas Admin</p>
                    <p className="font-mono text-lg font-extrabold tracking-widest mt-1">
                      ADM • 2026 • KDS • 01
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[10px] text-white/50">Penanggung Jawab</p>
                      <p className="font-bold">{user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/50">Tim Aktif</p>
                      <p className="font-bold text-[#f95724]">5 Petugas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Toggle Controls (Mirip Card Controls di frame Manage video) */}
              <div className={`lg:col-span-7 rounded-[28px] border p-6 space-y-4 ${cardBg}`}>
                <h3 className="text-sm font-extrabold">Kontrol Keamanan & Alur Laporan</h3>
                <div className="space-y-3">
                  {[
                    {
                      key: 'gpsStrict',
                      title: 'Wajib Validasi GPS Warga',
                      desc: 'Menolak pengaduan yang tidak menyertakan koordinat lokasi perangkat.',
                    },
                    {
                      key: 'autoNotifOfficer',
                      title: 'Distribusi Tugas Petugas 1–5',
                      desc: 'Aktifkan penugasan langsung ke akun masing-masing petugas lapangan.',
                    },
                    {
                      key: 'antiSpamFilter',
                      title: 'Filter Anti-Bot & Jeda 60 Detik',
                      desc: 'Mencegah pengiriman laporan spam beruntun dari formulir publik.',
                    },
                    {
                      key: 'publicLiveFeed',
                      title: 'Tampilkan Status di Portal Warga',
                      desc: 'Warga dapat memantau progres tiket lewat menu Lacak Laporan.',
                    },
                  ].map((ctrl) => {
                    const isOn = controls[ctrl.key];
                    return (
                      <div
                        key={ctrl.key}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${subCardBg}`}
                      >
                        <div>
                          <p className="text-xs font-extrabold">{ctrl.title}</p>
                          <p className={`text-[11px] mt-0.5 ${mutedText}`}>{ctrl.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setControls((prev) => ({ ...prev, [ctrl.key]: !prev[ctrl.key] }))}
                          className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                            isOn ? 'bg-[#f95724]' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                              isOn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: PETUGAS 1-5 (MIRIP BANNER REWARDS ORANGE VIDEO)   */}
          {/* ========================================================= */}
          {menu === 'petugas' && (
            <div className="space-y-5">
              {/* Banner 3D Oranye Besar */}
              <div className="bento-orange-3d rounded-[28px] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="space-y-1.5 relative">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                    Tim Lapangan Kabupaten Kudus
                  </span>
                  <h2 className="text-3xl font-extrabold pt-1">{OFFICERS.length} Petugas Aktif</h2>
                  <p className="text-xs text-white/85 max-w-md">
                    Setiap petugas memiliki username dan password terpisah untuk memperbarui status pengerjaan di lapangan.
                  </p>
                </div>
                <button
                  onClick={() => setMenu('laporan')}
                  className="px-5 py-3 rounded-full bg-[#181a1f] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg self-start sm:self-center cursor-pointer"
                >
                  Tugaskan Laporan <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Kartu Petugas 1 - 5 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {OFFICERS.map((off) => {
                  const taskCount = reports.filter(
                    (r) => r.assignedToUsername === off.username && r.status !== 'Laporan Selesai'
                  ).length;
                  return (
                    <div key={off.id} className={`rounded-[24px] border p-5 space-y-3 ${cardBg}`}>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-orange-500/10 text-[#f95724] text-[11px] font-extrabold">
                          {off.label}
                        </span>
                        <span className={`text-[11px] font-bold ${mutedText}`}>
                          {taskCount} Tugas Aktif
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold">{off.name}</h3>
                        <p className={`text-xs mt-0.5 ${mutedText}`}>{off.unit}</p>
                      </div>
                      <div className={`pt-2 border-t text-[11px] font-mono flex justify-between ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                        <span>user: {off.username}</span>
                        <span>{off.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: BACKUP & RESTORE DATA                             */}
          {/* ========================================================= */}
          {menu === 'backup' && (
            <div className="space-y-5">
              {backupNotice && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold ${
                    backupNotice.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                      : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}
                >
                  {backupNotice.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`rounded-[28px] border p-6 flex flex-col justify-between gap-4 ${cardBg}`}>
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bento-orange-3d text-white flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold pt-1">Unduh Cadangan Penuh (.JSON)</h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Simpan seluruh database laporan ({reports.length} tiket), koordinat GPS, dan penugasan petugas ke satu file cadangan.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadJsonBackup}
                    className="w-full py-3 rounded-full bento-orange-3d text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Backup JSON
                  </button>
                </div>

                <div className={`rounded-[28px] border p-6 flex flex-col justify-between gap-4 ${cardBg}`}>
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold pt-1">Ekspor Rekap Excel (.CSV)</h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Unduh rekap pengaduan fasilitas umum Kabupaten Kudus dalam format tabel siap buka di Microsoft Excel.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Download Rekap CSV
                  </button>
                </div>

                <div className={`rounded-[28px] border p-6 flex flex-col justify-between gap-4 ${cardBg}`}>
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold pt-1">Pulihkan Data dari File (.JSON)</h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Unggah kembali file <code className="font-mono">.json</code> hasil backup untuk mengembalikan seluruh data ke dashboard ini.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleRestoreJson}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 rounded-full bg-[#181a1f] hover:bg-[#f95724] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> Pilih File Backup & Restore
                    </button>
                  </div>
                </div>

                <div className={`rounded-[28px] border p-6 flex flex-col justify-between gap-4 ${cardBg}`}>
                  <div className="space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold pt-1">Reset ke Data Awal Simulasi</h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Kembalikan daftar laporan Kabupaten Kudus ke 5 data contoh bawaan sistem.
                    </p>
                  </div>
                  <button
                    onClick={handleResetDefault}
                    className="w-full py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Data Sistem
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL PENUGASAN PETUGAS 1–5 */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className={`rounded-[28px] border max-w-md w-full p-6 space-y-4 shadow-2xl ${cardBg}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-[#f95724]">{selectedReport.id}</span>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className={`text-xs font-bold hover:text-[#f95724] cursor-pointer ${mutedText}`}
                  >
                    Tutup
                  </button>
                </div>
                <img
                  src={selectedReport.image}
                  alt={selectedReport.title}
                  className="w-full h-40 object-cover rounded-2xl"
                />
                <h3 className="text-base font-extrabold">{selectedReport.title}</h3>
                <p className={`text-xs ${mutedText}`}>{selectedReport.description}</p>

                <div className="pt-1">
                  <label className="block text-xs font-bold mb-1.5">
                    Pilih Petugas Lapangan (Petugas 1 – 5):
                  </label>
                  <select
                    value={selectedOfficerUsername}
                    onChange={(e) => setSelectedOfficerUsername(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-bold ${subCardBg}`}
                  >
                    {OFFICERS.map((off) => (
                      <option key={off.id} value={off.username}>
                        {off.label} — {off.name} ({off.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => handleReject(selectedReport.id)}
                    className="py-2.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-500/20 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Tolak
                  </button>
                  <button
                    onClick={() => handleAssign(selectedReport.id)}
                    className="py-2.5 rounded-full bento-orange-3d text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Tugaskan
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
          darkMode ? 'bg-[#181b21]/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}
      >
        {dockItems.map((item) => {
          const Icon = item.icon;
          const active = menu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setMenu(item.id);
                setBackupNotice(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold transition ${
                active ? 'bento-orange-3d text-white' : mutedText
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