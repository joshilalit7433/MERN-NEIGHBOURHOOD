import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx'; // Corrected path (changed from 'Authcontext' to 'AuthContext')
import './App.css';
import Home from './routes/Home';
import Sidebar from './components/Sidebar';
import Maintenance from './components/Maintenance';
import Members from './components/Members';
import Billing from './components/Billing';
import Events from './components/Events';
import Register from './components/Register';
import Complaints from './components/Complaints';
import Login from './components/Login';
import CreateNotice from './components/CreateNotice';
import NoticeDetails from './components/NoticeDetails';
import CreateNewBill from './components/CreateNewBill';
import ComplaintDetails from './components/CviewDetails'; // Corrected from 'CviewDetails' to 'ComplaintDetails'

function AppContent() {
  const { user, loading } = useAuth(); // Use AuthContext for authentication

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    setIsAuthenticated(!!user); // Update authentication state when user changes
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen">
        {isAuthenticated && <Sidebar />}
        <div className={`flex-1 ${isAuthenticated ? 'ml-64' : ''} p-6 bg-gray-100 overflow-y-auto`}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={isAuthenticated ? <Register /> : <Navigate to="/login" replace />} /> {/* Moved to protected route */}
            <Route path="/maintenance" element={isAuthenticated ? <Maintenance /> : <Navigate to="/login" replace />} />
            <Route path="/members" element={isAuthenticated ? <Members /> : <Navigate to="/login" replace />} />
            <Route path="/billing" element={isAuthenticated ? <Billing /> : <Navigate to="/login" replace />} />
            <Route path="/events" element={isAuthenticated ? <Events /> : <Navigate to="/login" replace />} />
            <Route path="/complaints" element={isAuthenticated ? <Complaints /> : <Navigate to="/login" replace />} />
            <Route path="/create-notice" element={isAuthenticated ? <CreateNotice /> : <Navigate to="/login" replace />} />
            <Route path="/notice/:noticeId" element={isAuthenticated ? <NoticeDetails /> : <Navigate to="/login" replace />} />
            <Route path="/create-new-bill" element={isAuthenticated ? <CreateNewBill /> : <Navigate to="/login" replace />} />
            <Route path="/complaint/:complaintId" element={isAuthenticated ? <ComplaintDetails /> : <Navigate to="/login" replace />} /> {/* Corrected component name */}
            <Route path="*" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;