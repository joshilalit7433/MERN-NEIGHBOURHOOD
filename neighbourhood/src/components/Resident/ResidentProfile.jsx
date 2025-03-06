import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig.js";
import ResidentSidebar from "./ResidentSidebar.jsx";
import { Link, useNavigate } from "react-router-dom";

const ResidentProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          setUserData(userDoc.data());
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

  const formattedCreatedAt = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not specified";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ResidentSidebar />
      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto border border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-center text-purple-700">My Profile</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <th className="py-2 px-4 text-left">Field</th>
                <th className="py-2 px-4 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Name</td>
                <td className="py-2 px-4 border-b text-gray-600">{userData?.name || "Not provided"}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Email</td>
                <td className="py-2 px-4 border-b text-gray-600">{user.email || "Not provided"}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Flat No</td>
                <td className="py-2 px-4 border-b text-gray-600">{userData?.flatNo || "Not provided"}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Contact No</td>
                <td className="py-2 px-4 border-b text-gray-600">{userData?.contactNo || "Not provided"}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b font-medium">Joined On</td>
                <td className="py-2 px-4 border-b text-gray-600">{formattedCreatedAt}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-6 flex gap-4">
            <Link
              to="/resident-profile/edit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg text-center hover:bg-blue-600"
            >
              Edit Profile
            </Link>
            <Link
              to="/resident-dashboard"
              className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg text-center hover:bg-gray-400"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentProfile;
