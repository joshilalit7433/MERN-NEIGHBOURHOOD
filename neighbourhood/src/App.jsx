import React, { useState, useEffect, Suspense, Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebaseConfig.js";
import "./App.css";
import Loading from "./components/Loading";

// Lazy load components
const ComplaintsList = React.lazy(() =>
  import("./components/ComplaintList.jsx")
);
const ViewDetails = React.lazy(() => import("./components/CviewDetails.jsx"));
const Maintenance = React.lazy(() => import("./components/Maintenance"));
const Members = React.lazy(() => import("./components/Members"));
const Billing = React.lazy(() => import("./components/Billing"));
const Events = React.lazy(() => import("./components/Events"));
const Register = React.lazy(() => import("./components/Register"));
const Complaints = React.lazy(() => import("./components/Complaints"));
const Login = React.lazy(() => import("./components/Login"));
const CreateNotice = React.lazy(() => import("./components/CreateNotice"));
const NoticeDetails = React.lazy(() => import("./components/NoticeDetails"));
const CreateNewBill = React.lazy(() => import("./components/CreateNewBill"));
const Home = React.lazy(() => import("./routes/Home.jsx"));
const FileComplaint = React.lazy(() =>
  import("./components/FileComplaint.jsx")
);
const Profile = React.lazy(() => import("./components/Profile.jsx"));
const ResidentDashboard = React.lazy(() => import("./routes/ResidentHome.jsx")); // Updated to match ResidentDashboard.jsx
const ResidentBilling = React.lazy(() =>
  import("./components/Resident/ResidentBilling.jsx")
);
const ResidentProfile = React.lazy(() =>
  import("./components/Resident/ResidentProfile.jsx")
); // Import ResidentProfile
const ResidentComplaints = React.lazy(() =>
  import("./components/Resident/ResidentComplaint.jsx")
); // Import ResidentComplaints
const ResidentNotice = React.lazy(() =>
  import("./components/Resident/ResidentNotice.jsx")
); // Import ResidentEvents
const ResidentMembers = React.lazy(() =>
  import("./components/Resident/ResidentMembers.jsx")
); // Import ResidentMembers

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
    console.log("useRoleBasedRedirect - loading:", loading, "user:", user);
    if (loading) return;

    if (!user) {
      console.log("No user, redirecting to /login");
      setRoleLoading(false);
      navigate("/login");
      return;
    }

    const fetchUserRole = async () => {
      try {
        console.log("Fetching role for user:", user.uid);
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User data:", userData);
          setRole(userData.role || "Resident");
        } else {
          console.log("No user doc found, defaulting to Resident");
          setRole("Resident");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRole("Resident"); // Fallback to Resident on error
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

  console.log(
    "AppContent - roleLoading:",
    roleLoading,
    "loading:",
    loading,
    "role:",
    role
  );

  if (roleLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto">
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Common Routes (Login, Register) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Universal Routes (Accessible to All Authenticated Users) */}
          <Route path="/view-details/:id" element={<ViewDetails />} />
          <Route path="/file-complaint" element={<FileComplaint />} />{" "}
          {/* Remains universal */}
          {/* Root Redirect */}
          <Route
            path="/"
            element={
              role === "Committee Member" ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/resident-dashboard" replace />
              )
            }
          />
          {/* Committee Member Routes */}
          {role === "Committee Member" && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/members" element={<Members />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/events" element={<Events />} />
              <Route path="/create-notice" element={<CreateNotice />} />
              <Route path="/notice/:noticeId" element={<NoticeDetails />} />
              <Route path="/create-new-bill" element={<CreateNewBill />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/complaints" element={<Complaints />} />{" "}
              {/* Corrected path to /complaints */}
              <Route path="/complaints/:id" element={<ComplaintsList />} />{" "}
              {/* Corrected path to /complaints/:id */}
            </>
          )}
          {/* Resident Routes */}
          {role === "Resident" && (
            <>
              <Route
                path="/resident-dashboard"
                element={<ResidentDashboard />}
              />
              <Route path="/resident-billing" element={<ResidentBilling />} />
              <Route path="/resident-profile" element={<ResidentProfile />} />
              <Route
                path="/resident-complaints"
                element={<ResidentComplaints />}
              />{" "}
              {/* Already present and correct */}
              <Route path="/resident-notice" element={<ResidentNotice />} />
              <Route path="/resident-members" element={<ResidentMembers />} />
            </>
          )}
          {/* Catch-all Route */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  role === "Committee Member" ? "/home" : "/resident-dashboard"
                }
                replace
              />
            }
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
