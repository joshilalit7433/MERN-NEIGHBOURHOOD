import React from 'react';
import ResidentSidebar from '../components/Resident/ResidentSidebar.jsx'; // Ensure correct import
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FaUser, FaFileAlt, FaReceipt, FaCalendarAlt } from 'react-icons/fa'; // Import icons

export default function ResidentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Resident Sidebar */}
      <ResidentSidebar />

      {/* Main Dashboard Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-900 text-center">Resident Dashboard</h1>
          
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-gray-200 p-5 rounded-xl border border-gray-300 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800">Welcome, Resident!</h2>
              <p className="text-gray-600 mt-2">
                Manage your profile, view complaints, check billing, and stay updated with events and notices.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/profile"
                className="flex items-center space-x-3 bg-blue-100 p-5 rounded-xl border border-blue-300 hover:bg-blue-200 transition-all shadow-md"
              >
                <FaUser className="text-blue-700 text-2xl" />
                <div>
                  <h3 className="text-xl font-medium text-blue-800">View Profile</h3>
                  <p className="text-gray-600">Update your personal information and view your details.</p>
                </div>
              </Link>

              <Link
                to="/complaints"
                className="flex items-center space-x-3 bg-red-100 p-5 rounded-xl border border-red-300 hover:bg-red-200 transition-all shadow-md"
              >
                <FaFileAlt className="text-red-700 text-2xl" />
                <div>
                  <h3 className="text-xl font-medium text-red-800">File Complaint</h3>
                  <p className="text-gray-600">Submit or check the status of your complaints.</p>
                </div>
              </Link>

              <Link
                to="/resident-billing"
                className="flex items-center space-x-3 bg-yellow-100 p-5 rounded-xl border border-yellow-300 hover:bg-yellow-200 transition-all shadow-md"
              >
                <FaReceipt className="text-yellow-700 text-2xl" />
                <div>
                  <h3 className="text-xl font-medium text-yellow-800">View Billing</h3>
                  <p className="text-gray-600">Check your billing details and due dates.</p>
                </div>
              </Link>

              <Link
                to="/events"
                className="flex items-center space-x-3 bg-green-100 p-5 rounded-xl border border-green-300 hover:bg-green-200 transition-all shadow-md"
              >
                <FaCalendarAlt className="text-green-700 text-2xl" />
                <div>
                  <h3 className="text-xl font-medium text-green-800">View Events & Notices</h3>
                  <p className="text-gray-600">Stay updated with community events and notices.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
