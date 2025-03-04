// src/components/Resident/ResidentNotice.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx"; // Adjust path as needed
import { firestore } from "../../firebaseConfig.js"; // Adjust path as needed
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import ResidentSidebar from "./ResidentSidebar.jsx"; // Import Sidebar for layout consistency (adjust path as needed)

export default function ResidentNotice() {
  const { user, loading } = useAuth();
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Redirect or handle unauthenticated users (handled by App.jsx)
      return;
    }

    const fetchNotices = async () => {
      try {
        const noticesQuery = query(
          collection(firestore, "notices"),
          orderBy("createdAt", "desc") // Order by creation date, newest first
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
      }
    };

    fetchNotices();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
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
      <ResidentSidebar /> {/* Sidebar for layout consistency */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-lg max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-black">
            Events and Notices
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200"
              >
                <h3 className="text-lg font-semibold mb-2">{notice.title}</h3>
                <p className="text-gray-600 mb-2">Date: {notice.date}</p>
                <p className="text-gray-600 mb-4">Time: {notice.time}</p>
                <div className="flex justify-center">
                  <Link
                    to={`/view-details/${notice.id}`} // Updated to use universal ViewDetails route
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {notices.length === 0 && (
            <p className="mt-4 text-gray-500 text-center">
              No events or notices found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
