import { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  MapPin,
  Moon,
  Sun,
  Wrench,
} from 'lucide-react';
import { USERS_DB } from '../data/adminMockData';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const matchedUser = USERS_DB.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (matchedUser) {
      setError('');
      onLogin(matchedUser);
    } else {
      setError('Username atau password salah. Silakan periksa kembali.');
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col justify-between p-4 sm:p-8 ${
        darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f4f7fb] text-slate-900'
      }`}
    >
      {/* Top Floating Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bento-blue-3d text-white font-extrabold flex items-center justify-center text-sm">
            SF
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            Sigap<span className="text-blue-600">Fasum</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600/10 text-blue-600">
            <MapPin className="w-3.5 h-3.5" /> Portal Internal Kudus
          </span>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            title="Ubah Tema Terang / Gelap"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition cursor-pointer ${
              darkMode
                ? 'bg-[#141b29] border-slate-800 text-amber-400'
                : 'bg-white border-slate-200/80 text-slate-600 shadow-xs'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center 3D Bento Grid Login */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kartu Kiri: Showcase 3D Bento Biru */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bento-blue-3d rounded-[32px] p-7 text-white flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15 blur-xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-sky-300/20 blur-lg" />

            <div className="space-y-3 relative">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Sistem Terintegrasi 24 Jam
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight pt-1">
                Kendali Cepat Fasilitas Umum Kudus
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Akses terpisah untuk Admin Dinas dan Petugas Lapangan (Petugas 1–5) guna memverifikasi dan menindaklanjuti laporan warga.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 relative">
              <div className="rounded-2xl bg-white/15 backdrop-blur-xs p-3.5 border border-white/15">
                <p className="text-[11px] text-blue-100">Akses Admin</p>
                <p className="text-sm font-extrabold mt-0.5">Verifikasi & Backup</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur-xs p-3.5 border border-white/15">
                <p className="text-[11px] text-blue-100">Tim Lapangan</p>
                <p className="text-sm font-extrabold mt-0.5 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> Petugas 1 – 5
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-[26px] border p-5 flex items-center justify-between ${
              darkMode
                ? 'bg-[#141b29] border-slate-800'
                : 'bg-white border-slate-200/80 bento-3d'
            }`}
          >
            <div>
              <p className="text-xs font-extrabold">Wilayah Operasional</p>
              <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Dinas PUPR & Perkim Kabupaten Kudus
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-extrabold">
              ● Online
            </span>
          </div>
        </div>

        {/* Kartu Kanan: Form Login 3D Bento */}
        <div
          className={`lg:col-span-7 rounded-[32px] border p-7 sm:p-9 flex flex-col justify-between space-y-6 ${
            darkMode
              ? 'bg-[#141b29] border-slate-800'
              : 'bg-white border-slate-200/80 bento-3d'
          }`}
        >
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Masuk Portal Internal
            </h1>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Gunakan akun Admin atau akun Petugas 1 sampai Petugas 5 untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-500 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin atau petugas1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    darkMode
                      ? 'bg-[#1c2536] border-slate-700 text-white'
                      : 'bg-[#f8fafc] border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    darkMode
                      ? 'bg-[#1c2536] border-slate-700 text-white'
                      : 'bg-[#f8fafc] border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bento-blue-3d text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Daftar Akun Demo Interaktif */}
          <div className={`pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={() => setShowAccounts(!showAccounts)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {showAccounts ? 'Sembunyikan Daftar Akun' : 'Lihat Daftar Akun (Admin & Petugas 1–5)'}
            </button>

            {showAccounts && (
              <div
                className={`mt-3 p-3.5 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] ${
                  darkMode ? 'bg-[#1c2536] border-slate-700' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                {USERS_DB.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setUsername(acc.username);
                      setPassword(acc.password);
                    }}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-blue-600/10 cursor-pointer transition"
                    title="Klik untuk isi otomatis"
                  >
                    <span className="font-extrabold">{acc.label}</span>
                    <span className="font-mono text-blue-600 font-bold">
                      {acc.username} / {acc.password}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`text-center text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        SigapFasum Kabupaten Kudus • Sistem Pelaporan & Penanganan Fasilitas Umum
      </footer>
    </div>
  );
}