import { useState } from 'react';
import { LayoutDashboard, ClipboardList, CheckCircle2, User, LogOut, MapPin, ExternalLink } from 'lucide-react';

export default function OfficerDashboard({ user, reports, setReports, onLogout }) {
  const [menu, setMenu] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tugas', label: 'Tugas Saya', icon: ClipboardList },
    { id: 'selesai', label: 'Selesai', icon: CheckCircle2 },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  const myTasks = reports.filter((r) => r.assignedToUsername === user.username);
  const activeTasks = myTasks.filter((r) => r.status !== 'Laporan Selesai');
  const doneTasks = myTasks.filter((r) => r.status === 'Laporan Selesai');

  const updateTaskStatus = (id, status) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

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
              <span className="text-[11px] text-blue-600 font-bold">{user.label}</span>
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

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {menu === 'dashboard' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold mb-1">
                  {user.label} ({user.id})
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900">Selamat pagi, {user.name}</h1>
                <p className="text-xs text-slate-500">{user.unit}</p>
              </div>
              <button
                onClick={onLogout}
                className="md:hidden px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold"
              >
                Keluar
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-3d rounded-2xl p-4">
                <p className="text-xs text-slate-500 font-semibold">Total Tugas Saya</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{myTasks.length}</p>
              </div>
              <div className="card-3d rounded-2xl p-4">
                <p className="text-xs text-amber-600 font-semibold">Perlu Dikerjakan</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">
                  {myTasks.filter((t) => t.status === 'Ditugaskan').length}
                </p>
              </div>
              <div className="card-3d rounded-2xl p-4">
                <p className="text-xs text-blue-600 font-semibold">Sedang Dikerjakan</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {myTasks.filter((t) => t.status === 'Dalam Penanganan').length}
                </p>
              </div>
              <div className="card-3d rounded-2xl p-4">
                <p className="text-xs text-emerald-600 font-semibold">Selesai</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">{doneTasks.length}</p>
              </div>
            </div>
          </>
        )}

        {(menu === 'dashboard' || menu === 'tugas') && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800">Daftar Tugas Lapangan ({user.label})</h2>
            {activeTasks.length === 0 ? (
              <div className="card-3d rounded-2xl p-6 text-center text-xs text-slate-500">
                Belum ada tugas baru yang ditugaskan ke {user.label}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="card-3d rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <img
                        src={task.image}
                        alt={task.title}
                        className="w-full h-36 object-cover rounded-xl mb-3"
                      />
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        {task.status}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-2">{task.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {task.location}
                      </p>
                      {task.mapUrl && (
                        <a
                          href={task.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline mt-1.5"
                        >
                          Buka Titik Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="pt-2">
                      {task.status === 'Ditugaskan' ? (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'Dalam Penanganan')}
                          className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          Mulai Kerjakan
                        </button>
                      ) : (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'Laporan Selesai')}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Tandai Selesai
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {menu === 'selesai' && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Tugas Selesai Dikerjakan</h2>
            {doneTasks.length === 0 ? (
              <div className="card-3d rounded-2xl p-6 text-center text-xs text-slate-500">
                Belum ada riwayat tugas selesai untuk {user.label}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {doneTasks.map((task) => (
                  <div key={task.id} className="card-3d rounded-2xl p-4 space-y-2">
                    <img src={task.image} alt={task.title} className="w-full h-36 object-cover rounded-xl" />
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Selesai
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                    <p className="text-xs text-slate-500">{task.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {menu === 'profil' && (
          <div className="max-w-lg card-3d rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Profil {user.label}</h2>
            <div className="space-y-2 text-xs">
              <p><span className="text-slate-400">Nama Lengkap:</span> <strong>{user.name}</strong></p>
              <p><span className="text-slate-400">Username Login:</span> <strong>{user.username}</strong></p>
              <p><span className="text-slate-400">Kode Petugas:</span> <strong>{user.id}</strong></p>
              <p><span className="text-slate-400">Divisi:</span> <strong>{user.unit}</strong></p>
              <p><span className="text-slate-400">No. Telepon:</span> <strong>{user.phone}</strong></p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
            >
              Keluar dari Akun
            </button>
          </div>
        )}
      </main>

      {/* Bottom Bar Mobile */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg px-3 py-2 flex justify-around z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setMenu(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold ${
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