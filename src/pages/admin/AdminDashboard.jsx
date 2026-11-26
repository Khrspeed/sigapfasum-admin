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
} from 'lucide-react';
import { INITIAL_ADMIN_REPORTS, OFFICERS } from '../../data/adminMockData';

export default function AdminDashboard({ user, reports, setReports, onLogout }) {
  const [menu, setMenu] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOfficerUsername, setSelectedOfficerUsername] = useState(OFFICERS[0].username);
  const [backupNotice, setBackupNotice] = useState(null);
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'semua', label: 'Semua Laporan', icon: FileText },
    { id: 'verifikasi', label: 'Verifikasi', icon: Clock },
    { id: 'penanganan', label: 'Penanganan', icon: Wrench },
    { id: 'selesai', label: 'Selesai', icon: CheckCircle2 },
    { id: 'petugas', label: 'Petugas 1–5', icon: Users },
    { id: 'backup', label: 'Backup Data', icon: Database },
  ];

  const stats = {
    total: reports.length,
    verifikasi: reports.filter((r) => r.status === 'Menunggu Verifikasi').length,
    penanganan: reports.filter((r) => r.status === 'Dalam Penanganan' || r.status === 'Ditugaskan').length,
    selesai: reports.filter((r) => r.status === 'Laporan Selesai').length,
  };

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

  // 1. Unduh Backup Lengkap (.JSON)
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
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `backup-sigapfasum-kudus-${dateStamp}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setBackupNotice({
      type: 'success',
      text: `Backup JSON berhasil diunduh (${reports.length} data laporan tersimpan).`,
    });
  };

  // 2. Ekspor Rekap ke Excel (.CSV)
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
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `rekap-laporan-sigapfasum-${dateStamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setBackupNotice({
      type: 'success',
      text: 'File rekap CSV berhasil diunduh dan siap dibuka di Microsoft Excel.',
    });
  };

  // 3. Pulihkan / Restore Data dari File (.JSON)
  const handleRestoreJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const restoredList = Array.isArray(parsed) ? parsed : parsed.reports;

        if (!Array.isArray(restoredList) || !restoredList.every((item) => item.id && item.title)) {
          throw new Error('Format file backup tidak sesuai.');
        }

        setReports(restoredList);
        setBackupNotice({
          type: 'success',
          text: `Data berhasil dipulihkan! Sebanyak ${restoredList.length} laporan dimuat kembali.`,
        });
      } catch {
        setBackupNotice({
          type: 'error',
          text: 'Gagal memulihkan data. Pastikan file yang dipilih adalah file .json hasil backup SigapFasum.',
        });
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // 4. Reset ke Data Awal
  const handleResetDefault = () => {
    if (!window.confirm('Kembalikan seluruh data laporan ke data awal simulasi?')) return;
    setReports(INITIAL_ADMIN_REPORTS);
    setBackupNotice({
      type: 'success',
      text: 'Data berhasil dikembalikan ke pengaturan awal.',
    });
  };

  const filteredReports = reports.filter((r) => {
    const matchText =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    if (menu === 'verifikasi') return matchText && r.status === 'Menunggu Verifikasi';
    if (menu === 'penanganan') return matchText && (r.status === 'Dalam Penanganan' || r.status === 'Ditugaskan');
    if (menu === 'selesai') return matchText && r.status === 'Laporan Selesai';
    return matchText;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 pb-24 md:pb-0">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-5 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shadow-md shadow-blue-500/30">
              SF
            </div>
            <div>
              <p className="font-extrabold text-slate-900 leading-none">SigapFasum</p>
              <span className="text-[11px] text-slate-400">Admin Panel Kudus</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMenu(item.id);
                    setBackupNotice(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    menu === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-slate-800">{user.name}</p>
            <p className="text-[11px] text-slate-400">@{user.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-5 md:p-