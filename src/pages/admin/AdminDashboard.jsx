import { useState } from 'react';
import {
  LayoutDashboard, FileText, Clock, Wrench, CheckCircle2, Users,
  LogOut, Search, UserCheck, XCircle, ExternalLink
} from 'lucide-react';
import { OFFICERS } from '../../data/adminMockData';

export default function AdminDashboard({ user, reports, setReports, onLogout }) {
  const [menu, setMenu] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOfficerUsername, setSelectedOfficerUsername] = useState(OFFICERS[0].username);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'semua', label: 'Semua Laporan', icon: FileText },
    { id: 'verifikasi', label: 'Verifikasi', icon: Clock },
    { id: 'penanganan', label: 'Penanganan', icon: Wrench },
    { id: 'selesai', label: 'Selesai', icon: CheckCircle2 },
    { id: 'petugas', label: 'Petugas 1–5', icon: Users },
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
                  onClick={() => setMenu(item.id)}
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

        {menu !== 'petugas' && (
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
      <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg px-2 py-2 flex justify-around z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setMenu(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold ${
                menu === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}