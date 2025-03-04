// src/components/ResidentDashboard.jsx
import React from 'react';
import ResidentSidebar from '../components/Resident/ResidentSidebar'; // Import ResidentSidebar component

export default function ResidentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Resident Sidebar */}
      <ResidentSidebar />

      {/* Main Dashboard Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Resident Dashboard</h1>
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <h2 className="text-xl font-semibold text-gray-800">Welcome, Resident!</h2>
              <p className="text-gray-600 mt-2">
                Manage your profile, view complaints, check billing, and stay updated with events and notices.
              </p>
            </div>

            {/* Quick Links or Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Link: Profile */}
              <Link
                to="/profile"
                className="bg-blue-100 p-4 rounded-lg border border-blue-300 hover:bg-blue-200 transition-colors"
              >
                <h3 className="text-lg font-medium text-blue-800">View Profile</h3>
                <p className="text-gray-600 mt-1">Update your personal information and view your details.</p>
              </Link>

              {/* Quick Link: Complaints */}
              <Link
                to="/complaints"
                className="bg-red-100 p-4 rounded-lg border border-red-300 hover:bg-red-200 transition-colors"
              >
                <h3 className="text-lg font-medium text-red-800">File Complaint</h3>
                <p className="text-gray-600 mt-1">Submit or check the status of your complaints.</p>
              </Link>

              {/* Quick Link: Billing */}
              <Link
                to="/billing"
                className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 hover:bg-yellow-200 transition-colors"
              >
                <h3 className="text-lg font-medium text-yellow-800">View Billing</h3>
                <p className="text-gray-600 mt-1">Check your billing details and due dates.</p>
              </Link>

              {/* Quick Link: Events and Notices */}
              <Link
                to="/events"
                className="bg-green-100 p-4 rounded-lg border border-green-300 hover:bg-green-200 transition-colors"
              >
                <h3 className="text-lg font-medium text-green-800">View Events & Notices</h3>
                <p className="text-gray-600 mt-1">Stay updated with community events and notices.</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}