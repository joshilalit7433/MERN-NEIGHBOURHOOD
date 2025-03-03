import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; // Adjust the path to match your project structure
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ComplaintDetails() {
  const { complaintId } = useParams(); // Get the complaint ID from the URL parameter
  const { user, loading } = useAuth(); // Use auth context for user data
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null); // State for complaint data
  const [error, setError] = useState(null); // Error state
  const [selectedStatus, setSelectedStatus] = useState(''); // State for selected status
  const [formSuccess, setFormSuccess] = useState(null); // Success state for popup

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/register'); // Redirect to register if not authenticated
      return;
    }

    const fetchComplaint = async () => {
      try {
        const complaintRef = doc(firestore, 'complaints', complaintId);
        const complaintDoc = await getDoc(complaintRef);

        if (complaintDoc.exists()) {
          const data = complaintDoc.data();
          setComplaint({
            id: complaintDoc.id,
            name: data.name || 'Anonymous',
            description: data.description || 'No issue provided',
            status: data.status || 'Pending',
            createdAt: data.createdAt,
          });
          setSelectedStatus(data.status || 'Pending'); // Initialize selected status with current status
        } else {
          setError('Complaint not found.');
        }
      } catch (err) {
        console.error('Error fetching complaint:', err);
        setError('Failed to fetch complaint details. Please try again.');
      }
    };

    fetchComplaint();
  }, [complaintId, user, loading, navigate]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status); // Update the selected status in state
  };

  const handleSubmitStatus = async () => {
    if (!selectedStatus) {
      setError('Please select a status before submitting.');
      return;
    }

    try {
      const complaintRef = doc(firestore, 'complaints', complaintId);
      await updateDoc(complaintRef, { status: selectedStatus });
      
      // Update local state to reflect the new status
      setComplaint(prev => ({
        ...prev,
        status: selectedStatus,
      }));
      
      // Show success popup and redirect to Complaints page
      setFormSuccess('Status updated successfully!');
      alert('Status updated successfully!'); // Simple alert as a popup (you can replace with a modal)
      
      // Redirect back to Complaints page after a short delay (e.g., 1 second)
      setTimeout(() => {
        navigate('/complaints');
      }, 1000);
      
      setError(null);
    } catch (err) {
      console.error('Error updating complaint status:', err);
      setError('Failed to update complaint status. Please try again.');
    }
  };

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

  if (!complaint) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading complaint...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="border-2 border-black rounded-lg p-6 max-w-2xl mx-auto bg-white shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Complaint Details</h1>
        <div className="space-y-4 font-cursive">
          <p className="text-gray-800"><strong>Member:</strong> {complaint.name || 'Anonymous'}</p>
          <p className="text-gray-800"><strong>Issue:</strong> {complaint.description || 'No issue provided'}</p>
          <p className="text-gray-800"><strong>Current Status:</strong> 
            <span
              className={`font-semibold ml-2 ${
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
          <p className="text-gray-600"><strong>Created At:</strong> {complaint.createdAt?.toDate().toLocaleString() || 'Unknown'}</p>

          {/* Status Update Section */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Update Status</h3>
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => handleStatusChange('Pending')}
                className={`px-3 py-1 border border-black rounded-md ${
                  selectedStatus === 'Pending' ? 'bg-red-200 text-red-800' : 'bg-white hover:bg-gray-100'
                } transition`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusChange('In Progress')}
                className={`px-3 py-1 border border-black rounded-md ${
                  selectedStatus === 'In Progress' ? 'bg-yellow-200 text-yellow-800' : 'bg-white hover:bg-gray-100'
                } transition`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('Done')}
                className={`px-3 py-1 border border-black rounded-md ${
                  selectedStatus === 'Done' ? 'bg-green-200 text-green-800' : 'bg-white hover:bg-gray-100'
                } transition`}
              >
                Done
              </button>
            </div>
            <button
              onClick={handleSubmitStatus}
              className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 transition font-cursive"
            >
              Submit
            </button>
            {formSuccess && (
              <p className="mt-2 text-green-500 text-center">{formSuccess}</p>
            )}
          </div>

          <button
            onClick={() => navigate('/complaints')} // Back to Complaints page
            className="mt-4 px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 transition font-cursive"
          >
            Back to Complaints
          </button>
        </div>
      </div>
    </div>
  );
}