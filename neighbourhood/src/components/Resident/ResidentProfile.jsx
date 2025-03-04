// src/components/Resident/ResidentProfile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx"; // Adjusted path based on your project structure
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig.js"; // Adjusted path
import ResidentSidebar from "./ResidentSidebar.jsx"; // Import the ResidentSidebar

const ResidentProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setError("No user logged in");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
        } else {
          setError("User data not found in Firestore");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-700 bg-red-100 rounded">{error}</div>;
  }

  if (!userData) {
    return <div className="p-4">No user data available.</div>;
  }

  // Format the createdAt timestamp for display
  const formattedCreatedAt = userData.createdAt
    ? new Date(userData.createdAt).toLocaleString("en-US", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Not specified";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Resident Sidebar */}
      <ResidentSidebar />

      {/* Main Profile Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg border border-gray-300">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Resident Profile
          </h1>
          <div className="space-y-4 text-gray-800">
            <p>
              <strong>Name:</strong> {userData.name || "Not provided"}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "Not provided"}
            </p>
            <p>
              <strong>Role:</strong> {userData.role || "Resident"}
            </p>
            <p>
              <strong>Flat No:</strong> {userData.flatNo || "Not provided"}
            </p>
            <p>
              <strong>Contact No:</strong>{" "}
              {userData.contactNo || "Not provided"}
            </p>
            <p className="text-gray-600">
              <strong>Created At:</strong> {formattedCreatedAt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentProfile;
