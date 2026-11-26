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

export const PRIORITY_LEVELS = [
  {
    id: 'Tinggi',
    label: 'Tinggi',
    desc: 'Darurat / membahayakan warga',
    weight: 3,
    badgeClass: 'bg-red-500/15 text-red-600 border-red-500/30',
    activeBtnClass: 'bg-red-600 text-white border-red-600 shadow-md',
    dotClass: 'bg-red-500',
  },
  {
    id: 'Sedang',
    label: 'Sedang',
    desc: 'Perlu penanganan terjadwal',
    weight: 2,
    badgeClass: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    activeBtnClass: 'bg-amber-500 text-white border-amber-500 shadow-md',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'Rendah',
    label: 'Rendah',
    desc: 'Kerusakan ringan / estetika',
    weight: 1,
    badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    activeBtnClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
    dotClass: 'bg-emerald-500',
  },
];

export function getReportPriority(report) {
  if (report?.priority && ['Tinggi', 'Sedang', 'Rendah'].includes(report.priority)) {
    return report.priority;
  }
  const text = `${report?.category || ''} ${report?.title || ''}`.toLowerCase();
  if (
    text.includes('tumbang') ||
    text.includes('amblas') ||
    text.includes('berlubang') ||
    text.includes('listrik') ||
    text.includes('banjir')
  ) {
    return 'Tinggi';
  }
  if (text.includes('pju') || text.includes('lampu') || text.includes('drainase')) {
    return 'Sedang';
  }
  return 'Rendah';
}

export function getPriorityMeta(priority) {
  return (
    PRIORITY_LEVELS.find((p) => p.id === priority) ||
    PRIORITY_LEVELS.find((p) => p.id === 'Sedang')
  );
}

export function sortReportsByPriority(list = []) {
  return [...list].sort((a, b) => {
    const wA = getPriorityMeta(getReportPriority(a)).weight;
    const wB = getPriorityMeta(getReportPriority(b)).weight;
    return wB - wA;
  });
}

const minsAgoIso = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const INITIAL_ADMIN_REPORTS = [
  {
    id: 'SF-2026-001',
    title: 'Jalan Berlubang Kawasan Simpang Tujuh',
    category: 'Jalan Rusak',
    priority: 'Tinggi',
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
    priority: 'Sedang',
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
    priority: 'Sedang',
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
    priority: 'Rendah',
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
    priority: 'Tinggi',
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

export const TIMEFRAME_OPTIONS = [
  { id: 'today', label: 'Hari Ini' },
  { id: '1d', label: 'Per Hari' },
  { id: '1w', label: 'Per Minggu' },
  { id: '1mo', label: 'Per Bulan' },
  { id: '1y', label: 'Per Tahun' },
];

export const MONTH_OPTIONS = [
  { value: 0, short: 'Jan', full: 'Januari' },
  { value: 1, short: 'Feb', full: 'Februari' },
  { value: 2, short: 'Mar', full: 'Maret' },
  { value: 3, short: 'Apr', full: 'April' },
  { value: 4, short: 'Mei', full: 'Mei' },
  { value: 5, short: 'Jun', full: 'Juni' },
  { value: 6, short: 'Jul', full: 'Juli' },
  { value: 7, short: 'Agu', full: 'Agustus' },
  { value: 8, short: 'Sep', full: 'September' },
  { value: 9, short: 'Okt', full: 'Oktober' },
  { value: 10, short: 'Nov', full: 'November' },
  { value: 11, short: 'Des', full: 'Desember' },
];

export function getReportOfficerUsernames(report) {
  if (Array.isArray(report.assignedOfficers)) return report.assignedOfficers;
  if (report.assignedToUsername) return [report.assignedToUsername];
  return [];
}

export function setAnchorMonthYear(baseMs, targetYear, targetMonth) {
  const d = new Date(baseMs);
  const maxDay = new Date(targetYear, targetMonth + 1, 0).getDate();
  const safeDay = Math.min(d.getDate(), maxDay);
  return new Date(
    targetYear,
    targetMonth,
    safeDay,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds()
  ).getTime();
}

export function stepAnchorByTimeframe(baseMs, timeframe, direction) {
  const d = new Date(baseMs);
  if (timeframe === 'today') {
    return baseMs + direction * 24 * 60 * 60 * 1000;
  }
  if (timeframe === '1d') {
    return baseMs + direction * 7 * 24 * 60 * 60 * 1000;
  }
  if (timeframe === '1w') {
    return setAnchorMonthYear(baseMs, d.getFullYear(), d.getMonth() + direction);
  }
  if (timeframe === '1mo' || timeframe === '1y') {
    return setAnchorMonthYear(baseMs, d.getFullYear() + direction, d.getMonth());
  }
  return baseMs;
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

export function buildRealtimeStats(
  reports = [],
  timeframe = 'today',
  anchorMs = Date.now(),
  officerUsername = null
) {
  const scoped = officerUsername
    ? reports.filter((r) => getReportOfficerUsernames(r).includes(officerUsername))
    : reports;

  const refDate = new Date(anchorMs);
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const date = refDate.getDate();
  const buckets = [];
  let periodSummary = '';

  if (timeframe === 'today') {
    for (let h = 0; h < 24; h += 4) {
      const start = new Date(year, month, date, h, 0, 0, 0).getTime();
      const end = new Date(year, month, date, h + 4, 0, 0, 0).getTime();
      const startStr = `${String(h).padStart(2, '0')}:00`;
      const endStr = `${String(h + 4).padStart(2, '0')}:00`;
      buckets.push({
        label: startStr,
        fullLabel: `${DAY_NAMES[refDate.getDay()]}, ${date} ${MONTH_OPTIONS[month].short} (${startStr}–${endStr})`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
    periodSummary = `${DAY_NAMES[refDate.getDay()]}, ${date} ${MONTH_OPTIONS[month].full} ${year} (00:00–24:00)`;
  } else if (timeframe === '1w') {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let weekNum = 1;
    for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
      const endDay = Math.min(startDay + 6, daysInMonth);
      const start = new Date(year, month, startDay, 0, 0, 0).getTime();
      const end = new Date(year, month, endDay + 1, 0, 0, 0).getTime();
      buckets.push({
        label: `Mgg ${weekNum}`,
        fullLabel: `Minggu ${weekNum} (${startDay}–${endDay} ${MONTH_OPTIONS[month].short} ${year})`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
      weekNum += 1;
    }
    periodSummary = `${MONTH_OPTIONS[month].full} ${year} (${buckets.length} Minggu)`;
  } else if (timeframe === '1mo') {
    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1, 0, 0, 0).getTime();
      const end = new Date(year, m + 1, 1, 0, 0, 0).getTime();
      buckets.push({
        label: MONTH_OPTIONS[m].short,
        fullLabel: `${MONTH_OPTIONS[m].full} ${year}`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
    periodSummary = `Tahun ${year} (Januari – Desember)`;
  } else if (timeframe === '1y') {
    for (let y = year - 3; y <= year + 1; y++) {
      const start = new Date(y, 0, 1, 0, 0, 0).getTime();
      const end = new Date(y + 1, 0, 1, 0, 0, 0).getTime();
      buckets.push({
        label: String(y),
        fullLabel: `Tahun ${y}`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
    periodSummary = `Rentang Tahun ${year - 3} – ${year + 1}`;
  } else {
    const dayStart = new Date(year, month, date).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 6; i >= 0; i--) {
      const start = dayStart - i * dayMs;
      const end = start + dayMs;
      const d = new Date(start);
      buckets.push({
        label: `${DAY_NAMES[d.getDay()]} ${d.getDate()}`,
        fullLabel: `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_OPTIONS[d.getMonth()].short} ${d.getFullYear()}`,
        start,
        end,
        masuk: 0,
        selesai: 0,
      });
    }
    periodSummary = `${buckets[0].fullLabel.split(', ')[1]} – ${buckets[6].fullLabel.split(', ')[1]}`;
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

  return { items, totalMasuk, totalSelesai, periodSummary };
}