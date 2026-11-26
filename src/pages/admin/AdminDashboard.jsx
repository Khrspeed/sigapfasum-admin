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
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {navItems.find((n) => n.id === menu)?.label}
            </h1>
            <p className="text-xs text-slate-500">Manajemen Pengaduan Fasilitas Umum Kabupaten Kudus</p>
          </div>
          <button
            onClick={onLogout}
            className="md:hidden px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold"
          >
            Keluar
          </button>
        </div>

        {menu === 'dashboard' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-3d rounded-2xl p-5">
              <p className="text-xs text-slate-500 font-semibold">Total Laporan</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="card-3d rounded-2xl p-5">
              <p className="text-xs text-amber-600 font-semibold">Menunggu Verifikasi</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.verifikasi}</p>
            </div>
            <div className="card-3d rounded-2xl p-5">
              <p className="text-xs text-blue-600 font-semibold">Dalam Penanganan</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">{stats.penanganan}</p>
            </div>
            <div className="card-3d rounded-2xl p-5">
              <p className="text-xs text-emerald-600 font-semibold">Laporan Selesai</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.selesai}</p>
            </div>
          </div>
        )}

        {menu === 'petugas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OFFICERS.map((off) => {
              const taskCount = reports.filter(
                (r) => r.assignedToUsername === off.username && r.status !== 'Laporan Selesai'
              ).length;
              return (
                <div key={off.id} className="card-3d rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-bold">
                      {off.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {taskCount} Tugas Aktif
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 pt-1">{off.name}</h3>
                  <p className="text-xs text-slate-500">{off.unit}</p>
                  <p className="text-[11px] font-mono text-slate-400">Username: {off.username}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Menu Khusus Backup & Restore Data */}
        {menu === 'backup' && (
          <div className="space-y-5">
            {backupNotice && (
              <div
                className={`p-4 rounded-2xl border text-xs font-semibold ${
                  backupNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}
              >
                {backupNotice.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kartu 1: Unduh Backup JSON */}
              <div className="card-3d rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Unduh Cadangan Penuh (.JSON)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Simpan seluruh database laporan ({reports.length} tiket), koordinat peta, dan status penugasan petugas ke dalam satu file cadangan yang bisa dipulihkan kapan saja.
                  </p>
                </div>
                <button
                  onClick={handleDownloadJsonBackup}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Backup JSON
                </button>
              </div>

              {/* Kartu 2: Ekspor CSV / Excel */}
              <div className="card-3d rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ekspor Rekap Laporan (.CSV / Excel)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Unduh rekap data pengaduan fasilitas umum Kabupaten Kudus dalam format tabel CSV agar mudah dibuka, dicetak, atau diolah di Microsoft Excel.
                  </p>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Download Rekap Excel (CSV)
                </button>
              </div>

              {/* Kartu 3: Pulihkan / Restore Data */}
              <div className="card-3d rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pulihkan Data dari File (.JSON)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Unggah file <code className="font-mono text-slate-700">.json</code> hasil unduhan backup sebelumnya untuk mengembalikan seluruh data laporan ke dashboard ini.
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
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Pilih File Backup & Restore
                  </button>
                </div>
              </div>

              {/* Kartu 4: Reset Data Awal */}
              <div className="card-3d rounded-2xl p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Reset ke Data Awal Simulasi
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hapus perubahan sementara di browser dan kembalikan daftar laporan Kabupaten Kudus ke 5 data contoh bawaan sistem.
                  </p>
                </div>
                <button
                  onClick={handleResetDefault}
                  className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Data Sistem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Manajemen Laporan */}
        {menu !== 'petugas' && menu !== 'backup' && (
          <div className="card-3d rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-800">Daftar Laporan Masuk</h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari tiket atau lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400">
                    <th className="py-3 px-2">Tiket</th>
                    <th className="py-3 px-2">Judul & Lokasi</th>
                    <th className="py-3 px-2">Petugas</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReports.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-2 font-bold text-blue-600">{item.id}</td>
                      <td className="py-3.5 px-2">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <div className="flex items-center gap-2 text-slate-400">
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
                      <td className="py-3.5 px-2 text-slate-700 font-medium">
                        {item.assignedToName || <span className="italic text-slate-400">Belum ditugaskan</span>}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(item);
                            setSelectedOfficerUsername(item.assignedToUsername || OFFICERS[0].username);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-blue-600 transition cursor-pointer"
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

        {/* Modal Penugasan Petugas 1 - 5 */}
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-blue-600">{selectedReport.id}</span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <img
                src={selectedReport.image}
                alt={selectedReport.title}
                className="w-full h-40 object-cover rounded-2xl"
              />
              <h3 className="text-base font-bold text-slate-900">{selectedReport.title}</h3>
              <p className="text-xs text-slate-500">{selectedReport.description}</p>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Petugas Lapangan (Petugas 1 – 5):
                </label>
                <select
                  value={selectedOfficerUsername}
                  onChange={(e) => setSelectedOfficerUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
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
                  className="py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Tolak
                </button>
                <button
                  onClick={() => handleAssign(selectedReport.id)}
                  className="py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" /> Tugaskan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Bar Mobile */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg px-2 py-2 flex items-center gap-1 overflow-x-auto z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setMenu(item.id);
                setBackupNotice(null);
              }}
              className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                menu === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}