import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import Sidebar from '../components/Sidebar'; // Import Sidebar component

export default function CreateNotice() {
  const [formData, setFormData] = useState({
    name: '', // Will be populated from Firestore
    title: '', // Title
    date: '', // Date
    time: '', // Time
    description: '', // Description
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state for initial data fetch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // For programmatic navigation

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'Authenticated' : 'Not authenticated');
      setIsAuthenticated(!!user); // Set to true if a user is logged in
      if (!user) {
        navigate('/login'); // Redirect to login if not authenticated
      } else {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData((prevData) => ({
              ...prevData,
              name: userData.name || 'Anonymous', // Use user's name or default to 'Anonymous'
            }));
          } else {
            setFormData((prevData) => ({
              ...prevData,
              name: 'Anonymous', // Default if user data not found
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to fetch user data. Please try again.');
          setFormData((prevData) => ({
            ...prevData,
            name: 'Anonymous', // Fallback
          }));
        } finally {
          setLoading(false); // Stop loading once data is fetched
        }
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Show loading or error if not authenticated or fetching data
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Or a loading message (handled by redirect)
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      console.log('Attempting to create notice with data:', formData);

      // Add notice to Firestore 'notices' collection
      await addDoc(collection(firestore, 'notices'), {
        ...formData,
        createdBy: auth.currentUser?.uid || 'anonymous', // Store the authenticated user's UID
        createdAt: serverTimestamp(), // Automatically set the server timestamp
      });

      console.log('Notice created successfully in Firestore');

      setSuccess('Notice created successfully!');
      setFormData({
        name: formData.name, // Keep the user's name (read-only)
        title: '',
        date: '',
        time: '',
        description: '',
      });
      
      // Redirect to the events page after successful submission
      setTimeout(() => {
        navigate('/events'); // Redirect to the Events page
      }, 1000); // Optional: Delay to show the success message before redirecting
    } catch (error) {
      console.error('Error creating notice:', error);
      setError(error.message || 'An error occurred while creating the notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Component */}
      <Sidebar />

      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Notice</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Notice by: Name (Read-only, fetched from Firestore) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Notice by: Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                readOnly // Make it read-only since it’s fetched from Firestore
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your name"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter notice title"
                required
              />
            </div>

            {/* Date and Time (Side by Side) */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32 resize-none"
                placeholder="Enter notice description"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`mt-4 px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-indigo-600'} text-white rounded-md hover:${loading ? '' : 'bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}