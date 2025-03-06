import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { firestore } from "../../firebaseConfig.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import ResidentSidebar from "./ResidentSidebar.jsx";

export default function ResidentNotice() {
  const { user, loading } = useAuth();
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

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
      <ResidentSidebar />
      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center text-purple-600">Events and Notices</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <th className="py-2 px-4 border-b text-center">Title</th>
                <th className="py-2 px-4 border-b text-center">Date</th>
                <th className="py-2 px-4 border-b text-center">Time</th>
                <th className="py-2 px-4 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{notice.title}</td>
                  <td className="py-2 px-4 border-b text-center">{notice.date}</td>
                  <td className="py-2 px-4 border-b text-center">{notice.time}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <Link
                      to={`/view-details/${notice.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {notices.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-2 px-4 border-b text-center text-gray-500">
                    No events or notices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
