// src/components/FileComplaint.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Import Sidebar component

export default function FileComplaint() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    member: '',
    issue: '',
    status: 'Pending',
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/register');
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setFormData(prev => ({
            ...prev,
            member: userDoc.data().name || 'Anonymous',
          }));
        } else {
          setFormData(prev => ({ ...prev, member: 'Anonymous' }));
        }
      } catch (err) {
        setFormError('Failed to fetch user data.');
      }
    };

    fetchUserData();
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.issue.trim()) {
      setFormError('Issue description is required.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'complaints'), {
        name: formData.member,
        description: formData.issue,
        status: formData.status,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setFormSuccess('Complaint filed successfully!');
      setFormData({ member: formData.member, issue: '', status: 'Pending' });
      navigate('/complaints'); // Redirect back to Complaints page after success
    } catch (error) {
      setFormError('Failed to file complaint.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar />

      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-md mx-auto bg-white p-6 shadow-lg rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">File Complaint</h1>
          {formError && <p className="text-red-500 text-center mb-4">{formError}</p>}
          {formSuccess && <p className="text-green-500 text-center mb-4">{formSuccess}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="member" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
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
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                className="px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100 transition"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => navigate('/complaints')}
                className="px-4 py-2 border border-black rounded-md bg-white hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}