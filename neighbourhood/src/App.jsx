import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx'; // Ensure correct path
import { useState, useEffect, Suspense } from 'react';
import './App.css';
import Loading from './components/Loading'; // Import Loading component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from './firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';
// Lazy load components
const Maintenance = React.lazy(() => import('./components/Maintenance'));
const Members = React.lazy(() => import('./components/Members'));
const Billing = React.lazy(() => import('./components/Billing'));
const Events = React.lazy(() => import('./components/Events'));
const Register = React.lazy(() => import('./components/Register'));
const Complaints = React.lazy(() => import('./components/Complaints'));
const Login = React.lazy(() => import('./components/Login'));
const CreateNotice = React.lazy(() => import('./components/CreateNotice'));
const NoticeDetails = React.lazy(() => import('./components/NoticeDetails'));
const CreateNewBill = React.lazy(() => import('./components/CreateNewBill'));
const ComplaintDetails = React.lazy(() => import('./components/Complaints.jsx')); // Corrected path
const Home = React.lazy(() => import('./routes/Home.jsx'));
const FileComplaint = React.lazy(() => import('./components/FileComplaint.jsx'));
const Profile = React.lazy(() => import('./components/Profile.jsx'));
const ResidentDashboard = React.lazy(() => import('./routes/ResidentHome.jsx'));
const CommitteeDashboard = React.lazy(() => import('./routes/Home.jsx'));

// Import firestore from firebaseConfig for role fetching


// Role-based routing hook
function useRoleBasedRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate(); // Now safe to use since <Router> is in App
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchUserRole = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role || 'Resident'); // Default to 'Resident'
        } else {
          setRole('Resident');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole('Resident');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user, loading, navigate]);

  return { role, roleLoading };
}

function AppContent() {
  const { role, roleLoading } = useRoleBasedRedirect();

  if (roleLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen bg-gray-100 overflow-y-auto">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Suspense fallback={<Loading />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<Loading />}><Register /></Suspense>} />

        {/* Role-Based Routes */}
        <Route
          path="/"
          element={
            role === 'Committee Member' ? (
              <Navigate to="/home" CommitteeDashboard />
            ) : (
              <Navigate to="/resident-dashboard" ResidentDashboard />
            )
          }
        />
        <Route
          path="/home"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Committee Member' ? <Home /> : <Navigate to="/resident-dashboard" CommitteeDashboard />}
            </Suspense>
          }
        />
        <Route
          path="/resident-dashboard"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Resident' ? <ResidentDashboard /> : <Navigate to="/home" ResidentDashboard  />}
            </Suspense>
          }
        />
        <Route
          path="/committee-dashboard"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Committee Member' ? <CommitteeDashboard /> : <Navigate to="/resident-dashboard" CommitteeDashboard  />}
            </Suspense>
          }
        />
        <Route
          path="/maintenance"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Committee Member' ? <Maintenance /> : <Navigate to="/resident-dashboard" Maintenance />}
            </Suspense>
          }
        />
        <Route
          path="/members"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Committee Member' ? <Members /> : <Navigate to="/resident-dashboard" replace />}
            </Suspense>
          }
        />
        <Route
          path="/billing"
          element={
            <Suspense fallback={<Loading />}>
              <Billing />
            </Suspense>
          }
        />
        <Route
          path="/events"
          element={
            <Suspense fallback={<Loading />}>
              <Events />
            </Suspense>
          }
        />
        <Route
          path="/complaints"
          element={
            <Suspense fallback={<Loading />}>
              <Complaints />
            </Suspense>
          }
        />
        <Route
          path="/create-notice"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Committee Member' ? <CreateNotice /> : <Navigate to="/resident-dashboard" replace />}
            </Suspense>
          }
        />
        <Route
          path="/notice/:noticeId"
          element={
            <Suspense fallback={<Loading />}>
              <NoticeDetails />
            </Suspense>
          }
        />
        <Route
          path="/create-new-bill"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Committee Member' ? <CreateNewBill /> : <Navigate to="/billing" replace />}
            </Suspense>
          }
        />
        <Route
          path="/file-complaint"
          element={
            <Suspense fallback={<Loading />}>
              {role === 'Resident' ? <FileComplaint /> : <Navigate to="/complaints" replace />}
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/complaint/:complaintId"
          element={
            <Suspense fallback={<Loading />}>
              <ComplaintDetails />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to={role === 'Committee Member' ? '/home' : '/resident-dashboard'} replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router> {/* Router moved here */}
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
