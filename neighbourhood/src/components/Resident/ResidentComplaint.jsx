// ResidentComplaint.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx"; // Adjust path as needed
import { firestore } from "../../firebaseConfig.js"; // Adjust path as needed
import { collection, getDocs, query, where } from "firebase/firestore";
import ResidentSidebar from "./ResidentSidebar"; // Import the Sidebar (adjust path as needed)

const ResidentComplaint = () => {
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
        // Get the user's name from the auth context or user object
        const userName = user.displayName || user.email.split("@")[0]; // Adjust based on how you store user names

        // Query Firestore for complaints where the name matches the logged-in user's name
        const complaintsQuery = query(
          collection(firestore, "complaints"), // Adjust collection name if different
          where("name", "==", userName) // Match complaints by name
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
      <ResidentSidebar /> {/* Sidebar for layout consistency */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Complaints</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b text-center">Name</th>
                <th className="py-2 px-4 border-b text-center">FlatNo</th>
                <th className="py-2 px-4 border-b text-center">Complaint</th>
                <th className="py-2 px-4 border-b text-center">Status</th>
                <th className="py-2 px-4 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">
                    {complaint.name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {complaint.flatNo || "Not provided"}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {complaint.description}{" "}
                    {/* Changed from complaint.complaint to complaint.description */}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <span
                      className={`font-medium ${
                        complaint.status === "Done"
                          ? "text-green-600"
                          : complaint.status === "In Progress"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <a
                      href={`/view-details/${complaint.id}`} // Replace with your actual details route or link
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-2 px-4 border-b text-center text-gray-500"
                  >
                    No complaints found for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidentComplaint;
