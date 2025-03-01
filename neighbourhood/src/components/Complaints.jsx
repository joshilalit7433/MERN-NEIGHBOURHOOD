import React, { useState, useEffect } from 'react';
import { useAuth } from '../Authcontext'; // Adjust path to match your project structure
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc 
} from 'firebase/firestore';

export default function Complaints() {
  const { user, loading } = useAuth(); // Use auth context for user data
  const [complaints, setComplaints] = useState([]); // State for complaints from Firestore
  const [error, setError] = useState(null); // Error state
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [formData, setFormData] = useState({
    name: '', // Will be fetched from Firestore
    flatNumber: '', // Will be fetched from Firestore
    description: '',
    status: 'Open', // Default status for new complaints
  });
  const [formError, setFormError] = useState(null); // Form error state
  const [formSuccess, setFormSuccess] = useState(null); // Form success state

  // Fetch user data (name and flat number) from Firestore when user is authenticated
  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/login'; // Redirect to login if not authenticated
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData(prev => ({
            ...prev,
            name: userData.name || 'Anonymous', // Use Firestore name or fallback
            flatNumber: userData.flatNo || '', // Use Firestore flatNo (matching your screenshot)
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            name: 'Anonymous',
            flatNumber: '',
          }));
          console.warn('User document not found in Firestore.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please try again.');
        setFormData(prev => ({
          ...prev,
          name: 'Anonymous',
          flatNumber: '',
        }));
      }
    };

    fetchUserData();
  }, [user, loading]);

  // Fetch complaints from Firestore
  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/login'; // Redirect to login if not authenticated
      return;
    }

    const fetchComplaints = async () => {
      try {
        const complaintsQuery = query(
          collection(firestore, 'complaints'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(complaintsQuery);
        const complaintsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintsData);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to fetch complaints. Please try again.');
      }
    };

    fetchComplaints();
  }, [user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.flatNumber.trim() || !formData.description.trim()) {
      setFormError('Flat number and description are required.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'complaints'), {
        name: formData.name,
        flatNumber: formData.flatNumber,
        description: formData.description,
        status: formData.status, // Add status to the complaint
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setFormSuccess('Complaint filed successfully!');
      setFormData({
        name: formData.name, // Keep user's name (read-only from Firestore)
        flatNumber: '', // Clear flat number after submission
        description: '', // Clear description after submission
        status: 'Open', // Reset status to default
      });
      setIsModalOpen(false); // Close modal after success
    } catch (error) {
      console.error('Error filing complaint:', error);
      setFormError('Failed to file complaint. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="border-2 border-black rounded-lg p-6 max-w-2xl mx-auto bg-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-cursive">COMPLAINTS</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white border-2 border-black rounded-md font-cursive hover:bg-gray-100 transition"
          >
            File Complaint
          </button>
        </div>
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="border-2 border-black rounded-md p-4 font-cursive"
            >
              <p className="text-gray-800"><strong>Description:</strong> {complaint.description || 'No description provided'}</p>
              <p className="text-gray-600"><strong>Name:</strong> {complaint.name || 'Anonymous'}</p>
              <p className="text-gray-600"><strong>Flat Number:</strong> {complaint.flatNumber || 'N/A'}</p>
              <p className="text-gray-600"><strong>Status:</strong> {complaint.status || 'Open'}</p>
              <p className="text-gray-500 text-sm">
                <strong>Created At:</strong> {complaint.createdAt?.toDate().toLocaleString() || 'Unknown'}
              </p>
            
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 font-cursive text-center">File Complaint</h2>
            {formError && <p className="text-red-500 text-center mb-4">{formError}</p>}
            {formSuccess && <p className="text-green-500 text-center mb-4">{formSuccess}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-cursive">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="mt-1 block w-full border-2 border-black rounded-md p-2 bg-gray-100 cursor-not-allowed font-cursive"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="flatNumber" className="block text-sm font-medium text-gray-700 font-cursive">
                  Flat Number
                </label>
                <input
                  type="text"
                  id="flatNumber"
                  name="flatNumber"
                  value={formData.flatNumber}
                  readOnly
                  className="mt-1 block w-full border-2 border-black rounded-md p-2 bg-gray-100 cursor-not-allowed font-cursive"
                  placeholder="Enter your flat number"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 font-cursive">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-black rounded-md p-2 h-32 font-cursive resize-none focus:outline-none focus:ring-0"
                  placeholder="Describe your complaint..."
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 font-cursive">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-black rounded-md p-2 font-cursive focus:outline-none focus:ring-0"
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white border-2 border-black rounded-md font-cursive hover:bg-gray-100 transition"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border-2 border-black rounded-md font-cursive hover:bg-gray-100 transition"
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