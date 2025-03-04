// src/components/ViewDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link for consistency
import { useAuth } from "../AuthContext.jsx"; // Adjust path as needed
import { firestore } from "../firebaseConfig.js"; // Adjust path as needed
import { doc, getDoc } from "firebase/firestore"; // Removed updateDoc since we’re only viewing

export default function ViewDetails() {
  const { id } = useParams(); // Get the ID from the URL
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [creatorName, setCreatorName] = useState("Unknown"); // State for creator's name
  const [error, setError] = useState(null);
  const [resourceType, setResourceType] = useState(null); // To determine if it's a complaint or notice

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login"); // Redirect to login for unauthenticated users
      return;
    }

    if (!id || typeof id !== "string") {
      setError("Invalid resource ID.");
      return;
    }

    const fetchDetailsAndCreator = async () => {
      try {
        // Try fetching as a complaint first
        const complaintRef = doc(firestore, "complaints", id);
        const complaintDoc = await getDoc(complaintRef);

        if (complaintDoc.exists()) {
          setResourceType("complaint");
          const complaintData = complaintDoc.data();
          setDetails(complaintData);

          // Fetch the creator's name from the users collection using createdBy (UID)
          if (complaintData.createdBy) {
            console.log(
              "Fetching creator for complaint, UID:",
              complaintData.createdBy
            );
            const userRef = doc(firestore, "users", complaintData.createdBy);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("User data for creator:", userData);
              setCreatorName(userData.name || "Unknown"); // Use the user's name or default to "Unknown"
            } else {
              console.log(
                "User document not found for UID:",
                complaintData.createdBy
              );
              setCreatorName("Unknown"); // If user doc doesn't exist
            }
          } else {
            console.log("No createdBy field in complaint data");
            setCreatorName("Unknown");
          }
          return;
        }

        // If not a complaint, try fetching as a notice
        const noticeRef = doc(firestore, "notices", id);
        const noticeDoc = await getDoc(noticeRef);

        if (noticeDoc.exists()) {
          setResourceType("notice");
          const noticeData = noticeDoc.data();
          setDetails(noticeData);

          // Fetch the creator's name from the users collection using createdBy (UID)
          if (noticeData.createdBy) {
            console.log(
              "Fetching creator for notice, UID:",
              noticeData.createdBy
            );
            const userRef = doc(firestore, "users", noticeData.createdBy);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("User data for creator:", userData);
              setCreatorName(userData.name || "Unknown"); // Use the user's name or default to "Unknown"
            } else {
              console.log(
                "User document not found for UID:",
                noticeData.createdBy
              );
              setCreatorName("Unknown"); // If user doc doesn't exist
            }
          } else {
            console.log("No createdBy field in notice data");
            setCreatorName("Unknown");
          }
          return;
        }

        setError("Resource not found.");
      } catch (err) {
        console.error("Error fetching details or creator:", err);
        setError("Failed to fetch resource details. Please try again.");
      }
    };

    fetchDetailsAndCreator();
  }, [id, user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading resource...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-grow p-6 lg:ml-64">
        <div className="border-2 border-gray-300 rounded-lg p-6 max-w-2xl mx-auto bg-white shadow-lg">
          <h1 className="text-2xl font-bold mb-6">
            {resourceType === "complaint"
              ? "Complaint Details"
              : "Notice Details"}
          </h1>
          <div className="space-y-4 font-cursive">
            {resourceType === "complaint" ? (
              <>
                <p className="text-gray-800">
                  <strong>Member:</strong> {details.name || "Anonymous"}
                </p>
                <p className="text-gray-800">
                  <strong>Issue:</strong>{" "}
                  {details.description || "No issue provided"}
                </p>
                <p className="text-gray-800">
                  <strong>Flat Number:</strong>{" "}
                  {details.flatNo || "Not provided"} {/* Updated to flatNo */}
                </p>
                <p className="text-gray-800">
                  <strong>Current Status:</strong>
                  <span
                    className={`font-semibold ml-2 ${
                      details.status === "Pending"
                        ? "text-red-600"
                        : details.status === "In Progress"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {details.status}
                  </span>
                </p>
                <p className="text-gray-600">
                  <strong>Created At:</strong>{" "}
                  {new Date(details.createdAt?.toDate()).toLocaleString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </p>
                <p className="text-gray-600">
                  <strong>Created By:</strong> {creatorName}{" "}
                  {/* Display the creator's name */}
                </p>
                {/* Reply Section (view-only, only for complaints if reply exists) */}
                {details.reply && (
                  <p className="text-gray-800">
                    <strong>Reply:</strong> {details.reply}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-800">
                  <strong>Title:</strong> {details.title || "No title provided"}
                </p>
                <p className="text-gray-800">
                  <strong>Date:</strong> {details.date || "Not provided"}
                </p>
                <p className="text-gray-800">
                  <strong>Time:</strong> {details.time || "Not provided"}
                </p>
                <p className="text-gray-600">
                  <strong>Description:</strong>{" "}
                  {details.description || "No description provided"}
                </p>
                <p className="text-gray-600">
                  <strong>Created By:</strong> {creatorName}{" "}
                  {/* Display the creator's name */}
                </p>
              </>
            )}
            <Link
              to={
                resourceType === "complaint"
                  ? "/complaints"
                  : "/resident-notice"
              }
              className="mt-4 px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 transition font-cursive"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
