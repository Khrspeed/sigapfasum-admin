import { useEffect, useRef, useState } from 'react';
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
  UserPlus,
  Trash2,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';
import {
  INITIAL_ADMIN_REPORTS,
  MONTH_OPTIONS,
  TIMEFRAME_OPTIONS,
  USERS_DB,
  buildRealtimeStats,
  getReportOfficerUsernames,
  setAnchorMonthYear,
  stepAnchorByTimeframe,
} from '../../data/adminMockData';

export default function AdminDashboard({
  user,
  users,
  setUsers,
  reports,
  setReports,
  onLogout,
}) {
  const [menu, setMenu] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // State Statistik Realtime + Navigasi Bulan & Tahun (default: 'today' / Hari Ini)
  const [chartTimeframe, setChartTimeframe] = useState('today');
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [customAnchorMs, setCustomAnchorMs] = useState(() => Date.now());

  // Modal Penugasan Multi-Petugas pada 1 Laporan
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOfficerUsernames, setSelectedOfficerUsernames] = useState([]);

  // Modal Tambah Petugas Baru
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    username: '',
    password: '',
    unit: '',
    phone: '',
  });
  const [officerFormError, setOfficerFormError] = useState('');

  // Modal Tambah Banyak Tugas Bebas ke 1 Petugas
  const [assignToOfficerTarget, setAssignToOfficerTarget] = useState(null);
  const [selectedReportIdsForOfficer, setSelectedReportIdsForOfficer] = useState([]);

  const [backupNotice, setBackupNotice] = useState(null);

  const [controls, setControls] = useState({
    gpsStrict: true,
    autoNotifOfficer: true,
    publicLiveFeed: true,
    antiSpamFilter: true,
  });

  const fileInputRef = useRef(null);

  // Detak waktu realtime setiap 15 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const activeAnchorMs = isLiveMode ? nowTick : customAnchorMs;
  const anchorDateObj = new Date(activeAnchorMs);
  const selectedMonth = anchorDateObj.getMonth();
  const selectedYear = anchorDateObj.getFullYear();

  const baseCurrentYear = new Date(nowTick).getFullYear();
  const yearOptions = Array.from(
    new Set([
      baseCurrentYear - 2,
      baseCurrentYear - 1,
      baseCurrentYear,
      baseCurrentYear + 1,
      baseCurrentYear + 2,
      selectedYear - 1,
      selectedYear,
      selectedYear + 1,
    ])
  ).sort((a, b) => a - b);

  const handleChangeMonth = (newMonth) => {
    const updated = setAnchorMonthYear(activeAnchorMs, selectedYear, Number(newMonth));
    setCustomAnchorMs(updated);
    setIsLiveMode(false);
  };

  const handleChangeYear = (newYear) => {
    const updated = setAnchorMonthYear(activeAnchorMs, Number(newYear), selectedMonth);
    setCustomAnchorMs(updated);
    setIsLiveMode(false);
  };

  const handleStepPeriod = (direction) => {
    const updated = stepAnchorByTimeframe(activeAnchorMs, chartTimeframe, direction);
    setCustomAnchorMs(updated);
    setIsLiveMode(false);
  };

  const handleResetToLive = () => {
    const now = Date.now();
    setNowTick(now);
    setCustomAnchorMs(now);
    setIsLiveMode(true);
  };

  const officers = users.filter((u) => u.role === 'officer');
  const realtimeStats = buildRealtimeStats(reports, chartTimeframe, activeAnchorMs);
  const liveClockLabel = new Date(nowTick).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const topTabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'laporan', label: 'Laporan' },
    { id: 'kelola', label: 'Kelola' },
    { id: 'petugas', label: 'Petugas' },
    { id: 'backup', label: 'Backup Data' },
  ];

  const dockItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'laporan', label: 'Semua Laporan', icon: FileText },
    { id: 'kelola', label: 'Kontrol & Tugas', icon: SlidersHorizontal },
    { id: 'petugas', label: 'Petugas', icon: Users },
    { id: 'backup', label: 'Backup Data', icon: Database },
  ];

  const stats = {
    total: reports.length,
    verifikasi: reports.filter((r) => r.status === 'Menunggu Verifikasi').length,
    penanganan: reports.filter((r) => r.status === 'Dalam Penanganan' || r.status === 'Ditugaskan').length,
    selesai: reports.filter((r) => r.status === 'Laporan Selesai').length,
  };

  const completionPercent = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

  const formatAssignedNames = (report) => {
    const usernames = getReportOfficerUsernames(report);
    if (usernames.length === 0) return null;
    return usernames.map((uname) => {
      const found = officers.find((o) => o.username === uname);
      return found ? found.name : uname;
    });
  };

  const openManageReportModal = (report) => {
    setSelectedReport(report);
    setSelectedOfficerUsernames(getReportOfficerUsernames(report));
  };

  const toggleOfficerSelection = (username) => {
    setSelectedOfficerUsernames((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  const handleSaveMultiAssign = (reportId) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const hasOfficers = selectedOfficerUsernames.length > 0;
        return {
          ...r,
          assignedOfficers: selectedOfficerUsernames,
          updatedAt: new Date().toISOString(),
          status: hasOfficers
            ? r.status === 'Menunggu Verifikasi' || r.status === 'Ditolak'
              ? 'Ditugaskan'
              : r.status
            : 'Menunggu Verifikasi',
        };
      })
    );
    setNowTick(Date.now());
    setSelectedReport(null);
  };

  const handleReject = (reportId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: 'Ditolak', assignedOfficers: [], updatedAt: new Date().toISOString() }
          : r
      )
    );
    setNowTick(Date.now());
    setSelectedReport(null);
  };

  const handleAddOfficer = (e) => {
    e.preventDefault();
    const cleanUsername = newOfficer.username.trim().toLowerCase();
    if (!newOfficer.name.trim() || !cleanUsername || !newOfficer.password.trim()) {
      setOfficerFormError('Nama lengkap, username, dan password wajib diisi.');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setOfficerFormError('Username sudah dipakai. Gunakan username lain.');
      return;
    }

    const nextNum = officers.length + 1;
    const createdOfficer = {
      id: `PTG-${String(Date.now()).slice(-4)}`,
      username: cleanUsername,
      password: newOfficer.password.trim(),
      role: 'officer',
      label: 'Petugas Lapangan',
      name: newOfficer.name.trim(),
      unit: newOfficer.unit.trim() || `Tim Lapangan Kudus #${nextNum}`,
      phone: newOfficer.phone.trim() || '-',
    };

    setUsers((prev) => [...prev, createdOfficer]);
    setNewOfficer({ name: '', username: '', password: '', unit: '', phone: '' });
    setOfficerFormError('');
    setIsAddOfficerOpen(false);
  };

  const handleDeleteOfficer = (officerToRemove) => {
    if (
      !window.confirm(
        `Hapus petugas "${officerToRemove.name}" (@${officerToRemove.username}) dari daftar tim?`
      )
    ) {
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== officerToRemove.id));
    setReports((prev) =>
      prev.map((r) => ({
        ...r,
        assignedOfficers: getReportOfficerUsernames(r).filter(
          (uname) => uname !== officerToRemove.username
        ),
      }))
    );
  };

  const openAssignTasksToOfficer = (officer) => {
    setAssignToOfficerTarget(officer);
    const currentAssignedReportIds = reports
      .filter((r) => getReportOfficerUsernames(r).includes(officer.username))
      .map((r) => r.id);
    setSelectedReportIdsForOfficer(currentAssignedReportIds);
  };

  const toggleReportForOfficer = (reportId) => {
    setSelectedReportIdsForOfficer((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const handleSaveOfficerTasks = () => {
    if (!assignToOfficerTarget) return;
    const uname = assignToOfficerTarget.username;

    setReports((prev) =>
      prev.map((r) => {
        const currentList = getReportOfficerUsernames(r);
        const shouldHave = selectedReportIdsForOfficer.includes(r.id);

        if (shouldHave && !currentList.includes(uname)) {
          const updatedList = [...currentList, uname];
          return {
            ...r,
            assignedOfficers: updatedList,
            updatedAt: new Date().toISOString(),
            status:
              r.status === 'Menunggu Verifikasi' || r.status === 'Ditolak'
                ? 'Ditugaskan'
                : r.status,
          };
        }

        if (!shouldHave && currentList.includes(uname)) {
          const updatedList = currentList.filter((u) => u !== uname);
          return {
            ...r,
            assignedOfficers: updatedList,
            updatedAt: new Date().toISOString(),
          };
        }

        return r;
      })
    );

    setNowTick(Date.now());
    setAssignToOfficerTarget(null);
  };

  const handleDownloadJsonBackup = () => {
    const payload = {
      app: 'SigapFasum Kabupaten Kudus',
      exportedAt: new Date().toISOString(),
      exportedBy: user.name,
      totalReports: reports.length,
      totalOfficers: officers.length,
      users,
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
      text: `Backup JSON berhasil diunduh (${reports.length} laporan & ${officers.length} petugas tersimpan).`,
    });
  };

  const handleExportCsv = () => {
    const headers = [
      'ID Tiket',
      'Judul Kerusakan',
      'Kategori',
      'Lokasi',
      'Status',
      'Petugas Ditugaskan',
      'Pelapor',
      'Waktu Masuk',
      'Link Google Maps',
    ];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = reports.map((r) => {
      const names = formatAssignedNames(r);
      return [
        escapeCsv(r.id),
        escapeCsv(r.title),
        escapeCsv(r.category),
        escapeCsv(r.location),
        escapeCsv(r.status),
        escapeCsv(names ? names.join(', ') : 'Belum ditugaskan'),
        escapeCsv(r.reporter || '-'),
        escapeCsv(r.createdAt || '-'),
        escapeCsv(r.mapUrl || '-'),
      ];
    });
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
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          setUsers(parsed.users);
        }
        setNowTick(Date.now());
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

  const handleResetDefault = () => {
    if (!window.confirm('Kembalikan data laporan dan daftar petugas ke pengaturan awal?')) return;
    setReports(INITIAL_ADMIN_REPORTS);
    setUsers(USERS_DB);
    setNowTick(Date.now());
    setBackupNotice({ type: 'success', text: 'Data laporan dan daftar petugas berhasil direset.' });
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
                  onClick={() => {
                    setMenu(t.id);
                    setBackupNotice(null);
                  }}
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
              onClick={() => {
                setMenu('laporan');
                setStatusFilter('verifikasi');
              }}
              title="Laporan Menunggu Verifikasi"
              className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
                darkMode ? 'bg-[#141b29] border-slate-800 text-slate-300' : 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
              }`}
            >
              <Bell className="w-4 h-4" />
              {stats.verifikasi > 0 && (
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
        <aside
          className={`hidden lg:flex flex-col items-center justify-between py-4 px-2.5 rounded-[28px] border sticky top-24 min-h-[460px] shrink-0 ${
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
                  onClick={() => {
                    setMenu(item.id);
                    setBackupNotice(null);
                  }}
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
              <p className={`text-xs sm:text-sm mt-1 ${mutedText}`}>
                Pantau pengaduan fasilitas umum & distribusi tugas lapangan Kabupaten Kudus.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600/10 text-blue-600 self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5" /> Kabupaten Kudus • Admin Panel
            </span>
          </div>

          {/* VIEW 1: OVERVIEW */}
          {menu === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Kolom Kiri */}
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

                    <div className="grid grid-cols-2 gap-2.5 mt-6">
                      <button
                        onClick={() => {
                          setMenu('laporan');
                          setStatusFilter('verifikasi');
                        }}
                        className="py-3 px-4 rounded-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
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

                  {/* Progress Penyelesaian */}
                  <div className={`rounded-[28px] border p-6 space-y-3 ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">Target Penyelesaian</span>
                      <span className="text-xs font-extrabold text-blue-600">{completionPercent}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200/70 dark:bg-slate-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bento-blue-3d transition-all duration-500"
                        style={{ width: `${Math.max(completionPercent, 12)}%` }}
                      />
                    </div>
                    <div className={`flex justify-between text-[11px] font-semibold ${mutedText}`}>
                      <span>{stats.selesai} Laporan Selesai</span>
                      <span>Dari {stats.total} Total Tiket</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Tengah: Grid 2x2 Bento */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      setMenu('laporan');
                      setStatusFilter('verifikasi');
                    }}
                    className="bento-blue-3d rounded-[28px] p-5 text-white flex flex-col justify-between cursor-pointer relative overflow-hidden"
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
                      <p className="text-[11px] text-blue-100 mt-1 font-medium">Perlu dicek admin</p>
                    </div>
                  </div>

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

                  <div
                    onClick={() => setMenu('petugas')}
                    className={`rounded-[28px] border p-5 flex flex-col justify-between cursor-pointer ${cardBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${mutedText}`}>Petugas</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-3xl font-extrabold">{officers.length}</p>
                      <p className="text-[11px] text-blue-600 mt-1 font-bold">Tim Lapangan Kudus</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Grafik Statistik Realtime + Navigasi Bulan & Tahun */}
                <div className={`lg:col-span-4 rounded-[28px] border p-5 sm:p-6 flex flex-col justify-between ${cardBg}`}>
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-extrabold">Statistik Penanganan</h3>
                        <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                          {realtimeStats.periodSummary}
                        </p>
                      </div>

                      {isLiveMode ? (
                        <span
                          title={`Sinkron realtime: ${liveClockLabel}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 shrink-0"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Live {liveClockLabel.slice(0, 5)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResetToLive}
                          title="Kembali ke waktu realtime sekarang"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shrink-0"
                        >
                          <Radio className="w-3 h-3" /> Ke Live
                        </button>
                      )}
                    </div>

                    {/* Bar Navigasi Bulan Sebelumnya / Bulan Depan & Tahun */}
                    <div className={`flex items-center justify-between gap-1.5 p-1 rounded-full border ${subCardBg}`}>
                      <button
                        type="button"
                        onClick={() => handleStepPeriod(-1)}
                        title="Periode / Bulan / Tahun Sebelumnya"
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-blue-600/10 hover:text-blue-600 transition cursor-pointer shrink-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        <select
                          aria-label="Pilih Bulan"
                          value={selectedMonth}
                          onChange={(e) => handleChangeMonth(e.target.value)}
                          className={`text-[11px] font-extrabold bg-transparent focus:outline-none cursor-pointer px-1.5 py-0.5 rounded-lg ${
                            darkMode ? 'text-slate-100 [&>option]:bg-[#141b29]' : 'text-slate-800'
                          }`}
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.full}
                            </option>
                          ))}
                        </select>

                        <span className={`text-[10px] ${mutedText}`}>•</span>

                        <select
                          aria-label="Pilih Tahun"
                          value={selectedYear}
                          onChange={(e) => handleChangeYear(e.target.value)}
                          className={`text-[11px] font-extrabold bg-transparent focus:outline-none cursor-pointer px-1.5 py-0.5 rounded-lg ${
                            darkMode ? 'text-blue-400 [&>option]:bg-[#141b29]' : 'text-blue-600'
                          }`}
                        >
                          {yearOptions.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStepPeriod(1)}
                        title="Periode / Bulan / Tahun Berikutnya"
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-blue-600/10 hover:text-blue-600 transition cursor-pointer shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 5 Pilihan Rentang Waktu: Hari Ini, Per Hari, Per Minggu, Per Bulan, Per Tahun */}
                    <div className={`flex flex-wrap gap-1 p-1 rounded-2xl border ${subCardBg}`}>
                      {TIMEFRAME_OPTIONS.map((opt) => {
                        const active = chartTimeframe === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setChartTimeframe(opt.id)}
                            className={`flex-1 basis-[30%] py-1 px-2 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
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

                    <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          Masuk ({realtimeStats.totalMasuk})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              darkMode ? 'bg-slate-400' : 'bg-slate-800'
                            }`}
                          />
                          Selesai ({realtimeStats.totalSelesai})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Batang Grafik Dinamis */}
                  <div
                    style={{
                      gridTemplateColumns: `repeat(${realtimeStats.items.length}, minmax(0, 1fr))`,
                    }}
                    className="grid gap-1.5 items-end h-36 pt-4"
                  >
                    {realtimeStats.items.map((item) => {
                      const isCompact = realtimeStats.items.length > 7;
                      return (
                        <div
                          key={item.fullLabel}
                          className="flex flex-col items-center gap-1 h-full justify-end group"
                          title={`${item.fullLabel} • Masuk: ${item.masuk}, Selesai: ${item.selesai}`}
                        >
                          <span className="text-[8px] sm:text-[9px] font-extrabold text-blue-600 opacity-80 group-hover:opacity-100">
                            {item.masuk}/{item.selesai}
                          </span>
                          <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-20">
                            <div
                              style={{ height: `${item.masukHeight}%` }}
                              className={`${
                                isCompact ? 'w-1.5' : 'w-2.5'
                              } rounded-full transition-all duration-500 group-hover:scale-y-105 ${
                                item.masuk > 0 ? 'bento-blue-3d' : 'bg-blue-600/20'
                              }`}
                            />
                            <div
                              style={{ height: `${item.selesaiHeight}%` }}
                              className={`${
                                isCompact ? 'w-1.5' : 'w-2.5'
                              } rounded-full transition-all duration-500 ${
                                item.selesai > 0
                                  ? darkMode
                                    ? 'bg-slate-400'
                                    : 'bg-[#0f172a]'
                                  : darkMode
                                  ? 'bg-slate-700/60'
                                  : 'bg-slate-300/60'
                              }`}
                            />
                          </div>
                          <span
                            className={`${
                              isCompact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'
                            } font-bold truncate max-w-full ${mutedText}`}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 2: Laporan Terbaru */}
              <div className={`rounded-[28px] border p-6 space-y-4 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold">Aktivitas Laporan Warga Terbaru</h3>
                    <p className={`text-xs ${mutedText}`}>
                      Klik tombol Kelola untuk memverifikasi atau menugaskan satu maupun beberapa petugas.
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
                        className={`w-full pl-9 pr-3 py-2 rounded-full border text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${subCardBg}`}
                      />
                    </div>
                    <button
                      onClick={() => setMenu('laporan')}
                      className="px-4 py-2 rounded-full bg-[#0f172a] text-white text-xs font-bold hover:bg-blue-600 transition cursor-pointer shrink-0"
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
                      {filteredReports.slice(0, 5).map((item) => {
                        const assignedNames = formatAssignedNames(item);
                        return (
                          <tr key={item.id} className="hover:bg-blue-600/5 transition">
                            <td className="py-3.5 px-2 font-extrabold text-blue-600">{item.id}</td>
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
                                        className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
                                      >
                                        Maps <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-2">
                              {assignedNames ? (
                                <div className="flex flex-wrap gap-1">
                                  {assignedNames.map((n, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10"
                                    >
                                      {n}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className={`italic ${mutedText}`}>Belum ditugaskan</span>
                              )}
                            </td>
                            <td className="py-3.5 px-2">
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-600/10 text-blue-600">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => openManageReportModal(item)}
                                className="px-3.5 py-1.5 rounded-full bg-[#0f172a] hover:bg-blue-600 text-white font-bold transition cursor-pointer"
                              >
                                Kelola
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DAFTAR LENGKAP LAPORAN */}
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
                          ? 'bento-blue-3d text-white'
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
                    className={`w-full pl-9 pr-3 py-2 rounded-full border text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${subCardBg}`}
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
                    {filteredReports.map((item) => {
                      const assignedNames = formatAssignedNames(item);
                      return (
                        <tr key={item.id} className="hover:bg-blue-600/5">
                          <td className="py-3.5 px-2 font-extrabold text-blue-600">{item.id}</td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold">{item.title}</p>
                            <div className={`flex items-center gap-2 text-[11px] ${mutedText}`}>
                              <span>{item.location}</span>
                              {item.mapUrl && (
                                <a
                                  href={item.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
                                >
                                  Maps <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className={`py-3.5 px-2 ${mutedText}`}>{item.reporter || 'Warga Kudus'}</td>
                          <td className="py-3.5 px-2">
                            {assignedNames ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedNames.map((n, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10"
                                  >
                                    {n}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className={`italic ${mutedText}`}>Belum ditugaskan</span>
                            )}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-600/10 text-blue-600">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              onClick={() => openManageReportModal(item)}
                              className="px-3.5 py-1.5 rounded-full bg-[#0f172a] hover:bg-blue-600 text-white font-bold transition cursor-pointer"
                            >
                              Kelola
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: KELOLA & KONTROL */}
          {menu === 'kelola' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-5 rounded-[28px] border p-6 space-y-5 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold">Kartu Komando Dinas</h3>
                  <span className="text-[11px] font-bold text-blue-600">Kudus Command</span>
                </div>

                <div className="bento-dark-3d rounded-[24px] p-6 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-blue-600/30 blur-xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-white/80">
                      SIGAPFASUM KUDUS
                    </span>
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
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
                      <p className="font-bold text-blue-400">{officers.length} Petugas</p>
                    </div>
                  </div>
                </div>
              </div>

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
                      title: 'Distribusi Tugas Multi-Petugas',
                      desc: 'Memungkinkan satu laporan ditangani lebih dari satu petugas secara bersamaan.',
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
                            isOn ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
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

          {/* VIEW 4: KELOLA PETUGAS */}
          {menu === 'petugas' && (
            <div className="space-y-5">
              <div className="bento-blue-3d rounded-[28px] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="space-y-1.5 relative">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                    Tim Lapangan Kabupaten Kudus
                  </span>
                  <h2 className="text-3xl font-extrabold pt-1">{officers.length} Petugas Aktif</h2>
                  <p className="text-xs text-blue-100 max-w-md">
                    Tambah atau kurangi anggota petugas secara bebas, serta berikan beberapa tugas sekaligus sesuai kebutuhan lapangan.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 self-start sm:self-center relative">
                  <button
                    onClick={() => {
                      setOfficerFormError('');
                      setIsAddOfficerOpen(true);
                    }}
                    className="px-5 py-3 rounded-full bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Tambah Petugas
                  </button>
                  <button
                    onClick={() => setMenu('laporan')}
                    className="px-5 py-3 rounded-full bg-[#0f172a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    Kelola Laporan <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {officers.length === 0 ? (
                <div className={`rounded-[28px] border p-8 text-center text-xs ${cardBg} ${mutedText}`}>
                  Belum ada petugas terdaftar. Klik tombol <strong>Tambah Petugas</strong> di atas untuk menambahkan anggota baru.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {officers.map((off) => {
                    const officerReports = reports.filter((r) =>
                      getReportOfficerUsernames(r).includes(off.username)
                    );
                    const activeCount = officerReports.filter(
                      (r) => r.status !== 'Laporan Selesai'
                    ).length;

                    return (
                      <div
                        key={off.id}
                        className={`rounded-[24px] border p-5 flex flex-col justify-between gap-4 ${cardBg}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[11px] font-extrabold">
                              Petugas
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold ${mutedText}`}>
                                {activeCount} Aktif • {officerReports.length} Total
                              </span>
                              <button
                                onClick={() => handleDeleteOfficer(off)}
                                title="Hapus Petugas"
                                className="p-1.5 rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-extrabold">{off.name}</h3>
                            <p className={`text-xs mt-0.5 ${mutedText}`}>{off.unit}</p>
                          </div>

                          <div className={`p-3 rounded-2xl border space-y-1.5 ${subCardBg}`}>
                            <p className="text-[11px] font-extrabold text-blue-600">
                              Daftar Tugas ({officerReports.length}):
                            </p>
                            {officerReports.length === 0 ? (
                              <p className={`text-[11px] italic ${mutedText}`}>Belum ada tugas</p>
                            ) : (
                              <ul className="space-y-1 text-[11px]">
                                {officerReports.map((rep) => (
                                  <li
                                    key={rep.id}
                                    className="flex items-center justify-between gap-2 truncate"
                                  >
                                    <span className="truncate font-semibold">
                                      • {rep.id}: {rep.title}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <button
                            onClick={() => openAssignTasksToOfficer(off)}
                            className="w-full py-2.5 rounded-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Atur / Tambah Tugas
                          </button>

                          <div
                            className={`pt-2 border-t text-[11px] font-mono flex justify-between ${
                              darkMode
                                ? 'border-slate-800 text-slate-400'
                                : 'border-slate-100 text-slate-500'
                            }`}
                          >
                            <span>user: {off.username}</span>
                            <span>pass: {off.password}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: BACKUP & RESTORE DATA */}
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
                    <div className="w-11 h-11 rounded-2xl bento-blue-3d text-white flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold pt-1">Unduh Cadangan Penuh (.JSON)</h3>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Simpan seluruh database laporan ({reports.length} tiket) dan data akun ({officers.length} petugas) ke satu file cadangan.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadJsonBackup}
                    className="w-full py-3 rounded-full bento-blue-3d text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
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
                    <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
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
                      className="w-full py-3 rounded-full bg-[#0f172a] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
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
                      Kembalikan daftar laporan Kabupaten Kudus dan daftar petugas ke pengaturan bawaan sistem.
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

          {/* MODAL 1: PENUGASAN BEBAS MULTI-PETUGAS PADA 1 LAPORAN */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className={`rounded-[28px] border max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${cardBg}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-blue-600">{selectedReport.id}</span>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className={`text-xs font-bold hover:text-blue-600 cursor-pointer ${mutedText}`}
                  >
                    Tutup
                  </button>
                </div>
                <img
                  src={selectedReport.image}
                  alt={selectedReport.title}
                  className="w-full h-36 object-cover rounded-2xl"
                />
                <div>
                  <h3 className="text-base font-extrabold">{selectedReport.title}</h3>
                  <p className={`text-xs mt-1 ${mutedText}`}>{selectedReport.description}</p>
                </div>

                <div className="pt-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold">
                      Pilih Petugas (Bisa pilih 1 atau lebih):
                    </label>
                    <div className="flex gap-2 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectedOfficerUsernames(officers.map((o) => o.username))}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOfficerUsernames([])}
                        className={`${mutedText} hover:underline cursor-pointer`}
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {officers.map((off) => {
                      const checked = selectedOfficerUsernames.includes(off.username);
                      return (
                        <button
                          key={off.id}
                          type="button"
                          onClick={() => toggleOfficerSelection(off.username)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                            checked
                              ? 'border-blue-600 bg-blue-600/10 text-blue-600'
                              : `${subCardBg} ${mutedText}`
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold truncate">{off.name}</p>
                            <p className="text-[10px] truncate opacity-80">{off.unit}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              checked ? 'bg-blue-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => handleReject(selectedReport.id)}
                    className="py-2.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-500/20 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Tolak Laporan
                  </button>
                  <button
                    onClick={() => handleSaveMultiAssign(selectedReport.id)}
                    className="py-2.5 rounded-full bento-blue-3d text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Simpan ({selectedOfficerUsernames.length} Petugas)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 2: TAMBAH PETUGAS BARU */}
          {isAddOfficerOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className={`rounded-[28px] border max-w-md w-full p-6 space-y-4 shadow-2xl ${cardBg}`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-extrabold">Tambah Petugas Lapangan</h3>
                  <button
                    onClick={() => setIsAddOfficerOpen(false)}
                    className={`text-xs font-bold hover:text-blue-600 cursor-pointer ${mutedText}`}
                  >
                    Tutup
                  </button>
                </div>

                {officerFormError && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-500">
                    {officerFormError}
                  </div>
                )}

                <form onSubmit={handleAddOfficer} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Nama Lengkap Petugas</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Hendra Kusuma"
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs ${subCardBg}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold mb-1">Username Login</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: petugas6"
                        value={newOfficer.username}
                        onChange={(e) => setNewOfficer({ ...newOfficer, username: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-2xl border text-xs ${subCardBg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Password Login</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: ptg06kudus"
                        value={newOfficer.password}
                        onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-2xl border text-xs ${subCardBg}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Unit / Bidang Tugas</label>
                    <input
                      type="text"
                      placeholder="Contoh: Tim Jalan & Drainase Kudus"
                      value={newOfficer.unit}
                      onChange={(e) => setNewOfficer({ ...newOfficer, unit: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs ${subCardBg}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">No. Telepon / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Contoh: 0812-3456-7890"
                      value={newOfficer.phone}
                      onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border text-xs ${subCardBg}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full bento-blue-3d text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> Simpan Petugas Baru
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 3: ATUR BANYAK TUGAS BEBAS UNTUK 1 PETUGAS */}
          {assignToOfficerTarget && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className={`rounded-[28px] border max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${cardBg}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-extrabold text-blue-600">Atur Tugas Bebas</span>
                    <h3 className="text-base font-extrabold">{assignToOfficerTarget.name}</h3>
                  </div>
                  <button
                    onClick={() => setAssignToOfficerTarget(null)}
                    className={`text-xs font-bold hover:text-blue-600 cursor-pointer ${mutedText}`}
                  >
                    Tutup
                  </button>
                </div>

                <p className={`text-xs ${mutedText}`}>
                  Centang laporan mana saja yang ingin dikerjakan oleh <strong>{assignToOfficerTarget.name}</strong> (bisa memilih lebih dari satu tugas):
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {reports.map((rep) => {
                    const checked = selectedReportIdsForOfficer.includes(rep.id);
                    return (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => toggleReportForOfficer(rep.id)}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                          checked
                            ? 'border-blue-600 bg-blue-600/10'
                            : `${subCardBg}`
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-blue-600">{rep.id}</span>
                            <span className={`text-[10px] font-bold ${mutedText}`}>• {rep.status}</span>
                          </div>
                          <p className="text-xs font-bold truncate mt-0.5">{rep.title}</p>
                          <p className={`text-[11px] truncate ${mutedText}`}>{rep.location}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            checked ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveOfficerTasks}
                  className="w-full py-3 rounded-full bento-blue-3d text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Daftar Tugas ({selectedReportIdsForOfficer.length} Laporan)
                </button>
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
              onClick={() => {
                setMenu(item.id);
                setBackupNotice(null);
              }}
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