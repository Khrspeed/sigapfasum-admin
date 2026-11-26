import { useEffect, useState } from 'react';
import { INITIAL_ADMIN_REPORTS } from './data/adminMockData';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OfficerDashboard from './pages/officer/OfficerDashboard';

const STORAGE_KEY = 'sigapfasum_admin_reports_v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_REPORTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  if (user.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        reports={reports}
        setReports={setReports}
        onLogout={() => setUser(null)}
      />
    );
  }

  return (
    <OfficerDashboard
      user={user}
      reports={reports}
      setReports={setReports}
      onLogout={() => setUser(null)}
    />
  );
}