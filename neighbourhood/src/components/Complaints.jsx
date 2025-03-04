// src/components/Complaints.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx"; // Adjust path as needed
import { firestore } from "../firebaseConfig.js"; // Adjust path as needed
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar.jsx"; // Import Sidebar for layout consistency

export default function Complaints() {
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Redirect or handle unauthenticated users (handled by App.jsx)
      return;
    }

    const fetchComplaints = async () => {
      try {
        const complaintsQuery = query(
          collection(firestore, "complaints"),
          orderBy("createdAt", "desc") // Order by creation date, newest first
        );
        const querySnapshot = await getDocs(complaintsQuery);
        const complaintsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintsData);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to fetch complaints. Please try again.");
      }
    };

    fetchComplaints();
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
      <Sidebar /> {/* Sidebar for layout consistency */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-lg max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Complaints</h1>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Name</th>
                  <th className="border border-gray-300 p-2 text-left">
                    FlatNo
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Complaint
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Status
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      {complaint.name || "Anonymous"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {complaint.flatNo || "Not provided"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {complaint.description || "No issue provided"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <span
                        className={`font-semibold ${
                          complaint.status === "Pending"
                            ? "text-red-600"
                            : complaint.status === "In Progress"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Link
                        to={`/complaints/${complaint.id}`} // Correct path for /complaints/:id
                        className="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {complaints.length === 0 && (
            <p className="mt-4 text-gray-500 text-center">
              No complaints found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
