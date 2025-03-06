// ResidentComplaint.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { firestore } from "../../firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import ResidentSidebar from "./ResidentSidebar";

const ResidentComplaint = () => {
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const fetchComplaints = async () => {
      try {
        const userName = user.displayName || user.email.split("@")[0];
        const complaintsQuery = query(
          collection(firestore, "complaints"),
          where("name", "==", userName)
        );
        const querySnapshot = await getDocs(complaintsQuery);
        const complaintsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 font-semibold text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <ResidentSidebar />
      <div className="flex-grow p-10 lg:ml-64">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-5xl mx-auto border border-gray-300">
          <h2 className="text-3xl font-bold text-center text-gray-900 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            My Complaints
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-left">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Flat No</th>
                  <th className="py-4 px-6">Complaint</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-100 border-b">
                    <td className="py-4 px-6">{complaint.name}</td>
                    <td className="py-4 px-6">{complaint.flatNo || "Not provided"}</td>
                    <td className="py-4 px-6">{complaint.description}</td>
                    <td className="py-4 px-6 font-semibold text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm ${
                          complaint.status === "Done"
                            ? "bg-green-500"
                            : complaint.status === "In Progress"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-blue-600 hover:underline">
                      <a href={`/view-details/${complaint.id}`}>View Details</a>
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentComplaint;
