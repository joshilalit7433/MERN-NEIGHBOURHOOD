import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../components/Sidebar";

export default function Events({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setAuthState] = useState(false); // Renamed setIsAuthenticated to setAuthState

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAuthState(!!user); // Use renamed setter
      if (!user) {
        window.location.href = "/login";
      } else {
        const fetchNotices = async () => {
          try {
            const noticesQuery = query(
              collection(firestore, "notices"),
              orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(noticesQuery);
            const noticesData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setNotices(noticesData);
          } catch (err) {
            console.error("Error fetching notices:", err);
            setError("Failed to fetch notices. Please try again.");
          } finally {
            setLoading(false);
          }
        };

        fetchNotices();
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const handleDelete = async (noticeId) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteDoc(doc(firestore, "notices", noticeId));
        setNotices(notices.filter((notice) => notice.id !== noticeId));
        console.log("Notice deleted successfully");
      } catch (err) {
        console.error("Error deleting notice:", err);
        setError("Failed to delete notice. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    if (setIsAuthenticated) {
      setIsAuthenticated(false); // Use the prop to update parent state
    }
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-10 text-gray-900">
            Events and Notices
          </h1>

          <Link
            to="/create-notice"
            className="lg:mb-[200px] mb-16 px-5 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105 inline-block"
          >
            Create New Event
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {notice.title}
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-3">Date: {notice.date}</p>
                  <p className="text-gray-600 mb-5">Time: {notice.time}</p>
                  <div className="flex justify-between items-center space-x-3">
                    <Link
                      to={`/notice/${notice.id}`}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition transform hover:scale-105"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition transform hover:scale-105 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
