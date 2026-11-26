import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react';
import { USERS_DB } from '../data/adminMockData';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-[0_5px_0_#1d4ed8,0_10px_20px_rgba(37,99,235,0.4)]">
            SF
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 pt-2">
            Sigap<span className="text-blue-600">Fasum</span> Internal
          </h1>
          <p className="text-xs text-slate-500">
            Login khusus Admin Dinas & Petugas Lapangan Kabupaten Kudus
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Contoh: admin atau petugas1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Masukkan password akun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_5px_0_#1d4ed8,0_10px_20px_rgba(37,99,235,0.35)] active:translate-y-1 transition cursor-pointer"
          >
            Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Daftar Akun Demo */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAccounts(!showAccounts)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {showAccounts ? 'Sembunyikan Daftar Akun' : 'Lihat Daftar Akun (Admin & Petugas 1–5)'}
          </button>

          {showAccounts && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
              {USERS_DB.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(acc.password);
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                  title="Klik untuk isi otomatis"
                >
                  <span className="font-bold text-slate-700">{acc.label}</span>
                  <span className="font-mono text-blue-600">
                    {acc.username} / {acc.password}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}