// src/components/ComplaintsList.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx"; // Adjust path as needed
import { firestore } from "../firebaseConfig.js"; // Adjust path as needed
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "./Sidebar.jsx"; // Import Sidebar for layout consistency
const ComplaintsList = () => {
  const { id } = useParams(); // Get the complaint ID from the URL
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState(""); // State for reply text
  const [status, setStatus] = useState(""); // State for temporary status update

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchComplaint = async () => {
      try {
        const docRef = doc(firestore, "complaints", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setComplaint(data);
          setStatus(data.status || "Pending"); // Set initial status
          setReply(data.reply || ""); // Set initial reply (if exists)
        } else {
          setError("No complaint found for this ID.");
        }
      } catch (err) {
        console.error("Error fetching complaint:", err);
        setError("Failed to fetch complaint details. Please try again.");
      }
    };

    fetchComplaint();
  }, [id, user, loading, navigate]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const docRef = doc(firestore, "complaints", id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(), // Track when status was updated
      });
      setStatus(newStatus); // Update local state
      setComplaint((prev) => ({ ...prev, status: newStatus }));
      alert(`Status updated to "${newStatus}" successfully!`);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update complaint status. Please try again.");
    }
  };

  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };

  const handleReplySubmit = async () => {
    if (!reply.trim()) {
      setError("Reply cannot be empty.");
      return;
    }
    try {
      const docRef = doc(firestore, "complaints", id);
      await updateDoc(docRef, {
        reply: reply, // Add or update reply in Firestore
        updatedAt: new Date().toISOString(), // Track when reply was added/updated
      });
      setComplaint((prev) => ({ ...prev, reply: reply }));
      setReply(""); // Clear reply input
      alert("Reply added/updated successfully!");
    } catch (err) {
      console.error("Error adding/updating reply:", err);
      setError("Failed to add/update reply. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600 text-center">
          No complaint found for this ID.
        </p>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />{" "}
      {/* Sidebar for layout consistency (optional, can remove based on image) */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">
            Complaint Details
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Member:</strong> {complaint.name || "Not provided"}
            </p>
            <p>
              <strong>Issue:</strong>{" "}
              {complaint.description || "No issue provided"}
            </p>
            <p>
              <strong>Flat Number:</strong> {complaint.flatNo || "Not provided"}
            </p>
            <p>
              <strong>Current Status:</strong>
              <span
                className={`font-medium ml-2 ${
                  complaint.status === "Pending"
                    ? "text-red-600"
                    : complaint.status === "In Progress"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {complaint.status}
              </span>
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(complaint.createdAt?.toDate()).toLocaleString("en-US", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p>
              <strong>Created By:</strong>{" "}
              {complaint.createdBy || "Not provided"}
            </p>
            {/* Reply Section */}
            <div className="mt-4">
              <label
                htmlFor="reply"
                className="block text-sm font-medium text-gray-700"
              >
                Reply
              </label>
              <textarea
                id="reply"
                value={reply}
                onChange={handleReplyChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-24 resize-none focus:outline-none focus:ring-0"
                placeholder="Enter your reply here..."
              />
              <button
                onClick={handleReplySubmit}
                className="mt-2 px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100 transition"
              >
                Submit Reply
              </button>
            </div>
            {/* Display Existing Reply (if any) */}
            {complaint.reply && (
              <p className="mt-4">
                <strong>Reply:</strong> {complaint.reply}
              </p>
            )}
            {/* Status Update Buttons */}
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => handleStatusUpdate("Pending")}
                className={`px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100 transition ${
                  status === "Pending" ? "bg-gray-200" : ""
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusUpdate("In Progress")}
                className={`px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100 transition ${
                  status === "In Progress" ? "bg-gray-200" : ""
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusUpdate("Done")}
                className={`px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100 transition ${
                  status === "Done" ? "bg-gray-200" : ""
                }`}
              >
                Done
              </button>
            </div>
            {/* Back to List Button */}
            <Link
              to="/complaints"
              className="inline-block px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition text-center mt-6"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsList;
