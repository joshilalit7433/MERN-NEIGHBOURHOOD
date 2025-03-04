import React, { useState, useEffect, Suspense, Component } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig.js';
import './App.css';
import Loading from './components/Loading';

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
const Home = React.lazy(() => import('./routes/Home.jsx'));
const FileComplaint = React.lazy(() => import('./components/FileComplaint.jsx'));
const Profile = React.lazy(() => import('./components/Profile.jsx'));
const ResidentDashboard = React.lazy(() => import('./routes/ResidentHome.jsx')); // Updated to match ResidentDashboard.jsx
const ResidentBilling = React.lazy(() => import('./components/Resident/ResidentBilling.jsx'));

// Error Boundary
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <h1>Error: {this.state.error.message}</h1>;
    }
    return this.props.children;
  }
}

function useRoleBasedRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    console.log('useRoleBasedRedirect - loading:', loading, 'user:', user);
    if (loading) return;

    if (!user) {
      console.log('No user, redirecting to /login');
      setRoleLoading(false);
      navigate('/login');
      return;
    }

    const fetchUserRole = async () => {
      try {
        console.log('Fetching role for user:', user.uid);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setRole(userData.role || 'Resident');
        } else {
          console.log('No user doc found, defaulting to Resident');
          setRole('Resident');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole('Resident'); // Fallback to Resident on error
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
  const { loading } = useAuth();

  console.log('AppContent - roleLoading:', roleLoading, 'loading:', loading, 'role:', role);

  if (roleLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              role === 'Committee Member' ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/resident-dashboard" replace />
              )
            }
          />
          <Route
            path="/home"
            element={role === 'Committee Member' ? <Home /> : <Navigate to="/resident-dashboard" replace />}
          />
          <Route
            path="/resident-dashboard"
            element={role === 'Resident' ? <ResidentDashboard /> : <Navigate to="/home" replace />}
          />
          <Route
            path="/maintenance"
            element={role === 'Committee Member' ? <Maintenance /> : <Navigate to="/resident-dashboard" replace />}
          />
          <Route
            path="/members"
            element={role === 'Committee Member' ? <Members /> : <Navigate to="/resident-dashboard" replace />}
          />
          <Route
            path="/billing"
            element={role === 'Committee Member' ? <Billing /> : <Navigate to="/resident-dashboard" replace />}
          />
          <Route path="/events" element={<Events />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route
            path="/create-notice"
            element={role === 'Committee Member' ? <CreateNotice /> : <Navigate to="/resident-dashboard" replace />}
          />
          <Route path="/notice/:noticeId" element={<NoticeDetails />} />
          <Route
            path="/create-new-bill"
            element={role === 'Committee Member' ? <CreateNewBill /> : <Navigate to="/billing" replace />}
          />
          <Route
            path="/file-complaint"
            element={role === 'Resident' ? <FileComplaint /> : <Navigate to="/complaints" replace />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/resident-billing"
            element={role === 'Resident' ? <ResidentBilling /> : <Navigate to="/resident-billing" replace />}
          />
          <Route
            path="*"
            element={<Navigate to={role === 'Committee Member' ? '/home' : '/resident-dashboard'} replace />}
          />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;