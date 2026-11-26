export const USERS_DB = [
  {
    id: 'ADM-01',
    username: 'admin',
    password: 'adminkudus',
    role: 'admin',
    label: 'Administrator',
    name: 'Admin Dinas Kudus',
    unit: 'Dinas PUPR & Perkim Kab. Kudus',
    phone: '0291-431001',
  },
  {
    id: 'PTG-01',
    username: 'petugas1',
    password: 'ptg01kudus',
    role: 'officer',
    label: 'Petugas Lapangan',
    name: 'Budi Santoso',
    unit: 'Tim Jalan & Jembatan Kudus',
    phone: '0812-3456-7801',
  },
  {
    id: 'PTG-02',
    username: 'petugas2',
    password: 'ptg02kudus',
    role: 'officer',
    label: 'Petugas Lapangan',
    name: 'Ahmad Fauzi',
    unit: 'Tim PJU & Kelistrikan Kudus',
    phone: '0812-3456-7802',
  },
  {
    id: 'PTG-03',
    username: 'petugas3',
    password: 'ptg03kudus',
    role: 'officer',
    label: 'Petugas Lapangan',
    name: 'Rina Wati',
    unit: 'Tim Drainase & Sungai Kudus',
    phone: '0812-3456-7803',
  },
  {
    id: 'PTG-04',
    username: 'petugas4',
    password: 'ptg04kudus',
    role: 'officer',
    label: 'Petugas Lapangan',
    name: 'Dimas Saputra',
    unit: 'Tim Taman & Ruang Hijau Kudus',
    phone: '0812-3456-7804',
  },
  {
    id: 'PTG-05',
    username: 'petugas5',
    password: 'ptg05kudus',
    role: 'officer',
    label: 'Petugas Lapangan',
    name: 'Eko Prasetyo',
    unit: 'Tim Halte & Trotoar Kudus',
    phone: '0812-3456-7805',
  },
];

const minsAgoIso = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const INITIAL_ADMIN_REPORTS = [
  {
    id: 'SF-2026-001',
    title: 'Jalan Berlubang Kawasan Simpang Tujuh',
    category: 'Jalan Rusak',
    location: 'Jl. Simpang Tujuh, Kec. Kota Kudus',
    mapUrl: 'https://www.google.com/maps?q=-6.8048,110.8405',
    description: 'Lubang sedalam 15 cm di lajur kiri membahayakan pengendara motor saat malam hari.',
    status: 'Dalam Penanganan',
    assignedOfficers: ['petugas1', 'petugas3'],
    reporter: 'Ahmad Maulana',
    createdAt: minsAgoIso(140),
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SF-2026-002',
    title: 'Lampu Penerangan Jalan Mati Total',
    category: 'Lampu PJU',
    location: 'Jl. Jenderal Sudirman, Rendeng, Kudus',
    mapUrl: 'https://www.google.com/maps?q=-6.8095,110.8482',
    description: 'Tiga tiang lampu PJU padam sejak 3 hari lalu membuat jalanan gelap gulita.',
    status: 'Menunggu Verifikasi',
    assignedOfficers: [],
    reporter: 'Siti Nurhaliza',
    createdAt: minsAgoIso(18),
    image: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SF-2026-003',
    title: 'Saluran Air Tersumbat Sampah & Endapan',
    category: 'Drainase',
    location: 'Jl. Sunan Muria, Barongan, Kudus',
    mapUrl: 'https://www.google.com/maps?q=-6.7985,110.8420',
    description: 'Air meluap ke badan jalan setiap kali hujan deras turun lebih dari 30 menit.',
    status: 'Ditugaskan',
    assignedOfficers: ['petugas3'],
    reporter: 'Deni Pratama',
    createdAt: minsAgoIso(75),
    image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SF-2026-004',
    title: 'Trotoar Amblas Depan Taman Bojana',
    category: 'Halte & Trotoar',
    location: 'Jl. Pemuda, Kec. Kota Kudus',
    mapUrl: 'https://www.google.com/maps?q=-6.8062,110.8418',
    description: 'Paving trotoar amblas sepanjang 3 meter dan berisiko membuat pejalan kaki tersandung.',
    status: 'Ditugaskan',
    assignedOfficers: ['petugas5'],
    reporter: 'Ayu Lestari',
    createdAt: minsAgoIso(24 * 60),
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SF-2026-005',
    title: 'Pohon Tumbang Menutup Sebagian Taman',
    category: 'Taman Kota',
    location: 'Taman Krida Wisata, Wergu Wetan, Kudus',
    mapUrl: 'https://www.google.com/maps?q=-6.8150,110.8490',
    description: 'Dahan pohon besar patah akibat angin kencang dan menghalangi jalur pejalan kaki.',
    status: 'Laporan Selesai',
    assignedOfficers: ['petugas4'],
    reporter: 'Hendra Wijaya',
    createdAt: minsAgoIso(48 * 60),
    completedAt: minsAgoIso(12),
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
  },
];

export function getReportOfficerUsernames(report) {
  if (Array.isArray(report.assignedOfficers)) return report.assignedOfficers;
  if (report.assignedToUsername) return [report.assignedToUsername];
  return [];
}

function parseTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  const normalized = str.includes('T') ? str : `${str}T12:00:00`;
  const parsed = new Date(normalized).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTimeHHMM(ms) {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Menghitung data grafik statistik secara realtime berdasarkan rentang waktu:
 * '30m' (per 30 menit), '1h' (per 1 jam), '1d' (per hari), '1mo' (per bulan)
 */
export function buildRealtimeStats(reports = [], timeframe = '1d', nowMs = Date.now(), officerUsername = null) {
  const scoped = officerUsername
    ? reports.filter((r) => getReportOfficerUsernames(r).includes(officerUsername))
    : reports;

  const now = new Date(nowMs);
  const buckets = [];

  if (timeframe === '30m') {
    const stepMs = 30 * 60 * 1000;
    const currentBucketStart = Math.floor(nowMs / stepMs) * stepMs;
    for (let i = 6; i >= 0; i--) {
      const start = currentBucketStart - i * stepMs;
      const end = start + stepMs;
      buckets.push({
        label: formatTimeHHMM(start),
        fullLabel: `${formatTimeHHMM(start)} - ${formatTimeHHMM(end)}`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
  } else if (timeframe === '1h') {
    const stepMs = 60 * 60 * 1000;
    const currentBucketStart = Math.floor(nowMs / stepMs) * stepMs;
    for (let i = 6; i >= 0; i--) {
      const start = currentBucketStart - i * stepMs;
      const end = start + stepMs;
      buckets.push({
        label: formatTimeHHMM(start),
        fullLabel: `${formatTimeHHMM(start)} - ${formatTimeHHMM(end)}`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
  } else if (timeframe === '1mo') {
    for (let i = 6; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        label: MONTH_NAMES[startDate.getMonth()],
        fullLabel: `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()}`,
        start: startDate.getTime(),
        end: endDate.getTime(),
        masuk: 0,
        selesai: 0,
      });
    }
  } else {
    // Default: '1d' (Per Hari - 7 hari terakhir)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 6; i >= 0; i--) {
      const start = todayStart - i * dayMs;
      const end = start + dayMs;
      const d = new Date(start);
      buckets.push({
        label: DAY_NAMES[d.getDay()],
        fullLabel: `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
  }

  scoped.forEach((rep) => {
    const createdMs = parseTimestamp(rep.createdAt);
    if (createdMs !== null) {
      const bMasuk = buckets.find((b) => createdMs >= b.start && createdMs < b.end);
      if (bMasuk) bMasuk.masuk += 1;
    }

    if (rep.status === 'Laporan Selesai') {
      const doneMs = parseTimestamp(rep.completedAt || rep.updatedAt || rep.createdAt);
      if (doneMs !== null) {
        const bSelesai = buckets.find((b) => doneMs >= b.start && doneMs < b.end);
        if (bSelesai) bSelesai.selesai += 1;
      }
    }
  });

  const maxCount = Math.max(1, ...buckets.map((b) => Math.max(b.masuk, b.selesai)));
  const totalMasuk = buckets.reduce((acc, b) => acc + b.masuk, 0);
  const totalSelesai = buckets.reduce((acc, b) => acc + b.selesai, 0);

  const items = buckets.map((b) => ({
    ...b,
    masukHeight: b.masuk === 0 ? 8 : Math.max(18, Math.round((b.masuk / maxCount) * 100)),
    selesaiHeight: b.selesai === 0 ? 8 : Math.max(18, Math.round((b.selesai / maxCount) * 100)),
  }));

  return { items, totalMasuk, totalSelesai };
}