import { useEffect, useState } from 'react';
import { INITIAL_ADMIN_REPORTS, USERS_DB } from './data/adminMockData';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OfficerDashboard from './pages/officer/OfficerDashboard';

const REPORTS_STORAGE_KEY = 'sigapfasum_admin_reports_v2';
const USERS_STORAGE_KEY = 'sigapfasum_admin_users_v2';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : USERS_DB;
    } catch {
      return USERS_DB;
    }
  });

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_REPORTS;
    } catch {
      return INITIAL_ADMIN_REPORTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  if (!currentUser) {
    return <LoginPage users={users} onLogin={setCurrentUser} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        user={currentUser}
        users={users}
        setUsers={setUsers}
        reports={reports}
        setReports={setReports}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  return (
    <OfficerDashboard
      user={currentUser}
      users={users}
      reports={reports}
      setReports={setReports}
      onLogout={() => setCurrentUser(null)}
    />
  );
}