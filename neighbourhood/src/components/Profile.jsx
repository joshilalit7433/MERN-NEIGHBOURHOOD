import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx'; // Adjust the path to match your project structure
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Import Sidebar component

export default function Profile() {
  const { user, loading } = useAuth(); // Get the authenticated user from AuthContext
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null); // State for user profile data
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/register'); // Redirect to register if not authenticated
      return;
    }

    const fetchProfileData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid); // Use the user's UID from Auth
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            name: data.name || 'Anonymous',
            flat: data.flatNo || 'N/A',
            contact: data.contactNo || 'N/A',
            role: data.role || 'Member', // Use role from Firestore, default to 'Member'
          });
        } else {
          setError('User profile not found in Firestore.');
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to fetch profile data. Please try again.');
      }
    };

    fetchProfileData();
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return null; // Redirect handled via navigate in useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  if (!profileData) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading profile...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar />

      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg border border-gray-300">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">PROFILE</h1>
          <div className="flex flex-col items-center space-y-4">
            {/* Circular Profile Picture Placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              {/* Placeholder for profile image (you can replace with an actual image or upload functionality) */}
              No Image
            </div>

            {/* Profile Details */}
            <div className="w-full space-y-2">
              <div className="border border-gray-300 rounded-md p-3">
                <p className="text-gray-700"><strong>Name:</strong> {profileData.name}</p>
              </div>
              <div className="border border-gray-300 rounded-md p-3">
                <p className="text-gray-700"><strong>Flat:</strong> {profileData.flat}</p>
              </div>
              <div className="border border-gray-300 rounded-md p-3">
                <p className="text-gray-700"><strong>Contact:</strong> {profileData.contact}</p>
              </div>
              <div className="border border-gray-300 rounded-md p-3">
                <p className="text-gray-700"><strong>Role:</strong> {profileData.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}