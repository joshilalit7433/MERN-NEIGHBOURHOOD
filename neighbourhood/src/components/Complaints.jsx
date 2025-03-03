import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx"; // Corrected path
import { firestore } from "../firebaseConfig"; // Adjust the path to your Firebase config
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom"; // Added useNavigate for navigation
import Sidebar from "../components/Sidebar";

export default function Complaints() {
  const { user, loading } = useAuth(); // Use auth context for user data
  const [complaints, setComplaints] = useState([]); // State for complaints from Firestore
  const [error, setError] = useState(null); // Error state
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [formData, setFormData] = useState({
    member: "", // Will be fetched from Firestore (user's name)
    issue: "",
    status: "Pending", // Default status for new complaints
  });
  const [formError, setFormError] = useState(null); // Form error state
  const [formSuccess, setFormSuccess] = useState(null); // Form success state
  const navigate = useNavigate(); // Added navigate function for routing

  // Fetch user data (name) from Firestore when user is authenticated
  useEffect(() => {
    if (loading) return;

    if (!user) {
      return <Navigate to="/register" replace />;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef); // Use getDoc to fetch user data
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData((prev) => ({
            ...prev,
            member: userData.name || "Anonymous", // Use Firestore name or fallback
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            member: "Anonymous",
          }));
          console.warn("User document not found in Firestore.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data. Please try again.");
        setFormData((prev) => ({
          ...prev,
          member: "Anonymous",
        }));
      }
    };

    fetchUserData();
  }, [user, loading]);

  // Fetch complaints from Firestore
  useEffect(() => {
    if (loading) return;

    if (!user) {
      return <Navigate to="/register" replace />; // Use Navigate for React Router
    }

    const fetchComplaints = async () => {
      try {
        const complaintsQuery = query(
          collection(firestore, "complaints"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(complaintsQuery);
        const complaintsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          member: doc.data().name || "Anonymous", // Match Firestore field
          issue: doc.data().description || "No issue provided", // Match Firestore field
          status: doc.data().status || "Pending",
        }));
        setComplaints(complaintsData);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to fetch complaints. Please try again.");
      }
    };

    fetchComplaints();
  }, [user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.issue.trim()) {
      setFormError("Issue description is required.");
      return;
    }

    try {
      await addDoc(collection(firestore, "complaints"), {
        name: formData.member, // Store member name
        description: formData.issue, // Store issue description
        status: formData.status, // Explicitly store status (matches Firestore screenshot)
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        flatNumber: "", // Added to match Firestore structure (optional, can be removed if not needed)
      });

      setFormSuccess("Complaint filed successfully!");
      setFormData({
        member: formData.member, // Keep user's name (read-only from Firestore)
        issue: "", // Clear issue after submission
        status: "Pending", // Reset status to default
      });
      setIsModalOpen(false); // Close modal after success
    } catch (error) {
      console.error("Error filing complaint:", error);
      setFormError("Failed to file complaint. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/register" replace />; // Use Navigate for React Router
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />
      <div className="border border-black rounded-lg p-6 max-w-4xl mx-auto bg-white shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Complaints</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white border border-black rounded-md hover:bg-gray-100 transition"
          >
            File Complaint
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border font-semibold text-left">
                  Member
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Issue
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Status
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border">{complaint.member}</td>
                  <td className="px-4 py-2 border">{complaint.issue}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      complaint.status === "Pending"
                        ? "text-red-600"
                        : complaint.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {complaint.status}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => navigate(`/complaint/${complaint.id}`)} // Navigate to ComplaintDetails
                      className="px-3 py-1 border border-black rounded-md bg-white hover:bg-gray-100 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <p className="text-center mt-4 text-gray-500">
              No complaints found.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">
              File Complaint
            </h2>
            {formError && (
              <p className="text-red-500 text-center mb-4">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-green-500 text-center mb-4">{formSuccess}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="member"
                  className="block text-sm font-medium text-gray-700"
                >
                  Member
                </label>
                <input
                  type="text"
                  id="member"
                  name="member"
                  value={formData.member}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-200 cursor-not-allowed"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="issue"
                  className="block text-sm font-medium text-gray-700"
                >
                  Issue
                </label>
                <textarea
                  id="issue"
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-black rounded-md p-2 h-32 resize-none focus:outline-none focus:ring-0"
                  placeholder="Describe your issue..."
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-black rounded-md p-2 focus:outline-none focus:ring-0"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white border border-black rounded-md hover:bg-gray-100 transition"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-black rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
