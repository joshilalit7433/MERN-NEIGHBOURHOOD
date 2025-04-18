// src/components/Resident/ResidentSidebar.jsx
import React, { useContext } from "react"; // Added useContext for consistency with other components
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext.jsx"; // Import for potential future use (adjust path as needed)
import { auth } from "../../firebaseConfig.js"; // Adjusted path to match your project structure
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  User,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function ResidentSidebar({ handleLogout }) {
  const navigate = useNavigate();

  const sidebarLinks = [
    // {
    //   name: "Dashboard",
    //   icon: <LayoutDashboard className="text-purple-400" />,
    //   path: "/resident-dashboard",
    // },
    {
      name: "Profile",
      icon: <User className="text-green-400" />,
      path: "/resident-profile", // Updated from "/ResidentProfile" to lowercase with hyphen
    },
    {
      name: "Complaints",
      icon: <FileText className="text-blue-400" />,
      path: "/resident-complaints", // Updated from "/ResidentComplaints" to lowercase with hyphen
    },
    {
      name: "File Complaint",
      icon: <FileText className="text-blue-400" />, // Using FileText icon for consistency with Complaints
      path: "/file-complaint", // New link for filing complaints
    },
    {
      name: "Billing",
      icon: <DollarSign className="text-yellow-400" />,
      path: "/resident-billing",
    },
    {
      name: "Events and Notices",
      icon: <Calendar className="text-pink-400" />,
      path: "/resident-notice", // Updated from "/ResidentNotice" to lowercase with hyphen
    },
  ];

  const onLogout = async () => {
    try {
      await signOut(auth);
      handleLogout(); // Call the parent handleLogout to update authentication state
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <div className="fixed h-screen bg-[#1f2a44] shadow-lg w-64 text-white overflow-hidden">
      {/* Logo/Title */}
      <div className="mb-8 p-4">
        <h1 className="text-2xl font-bold uppercase">Resident Dashboard</h1>
      </div>

      {/* Navigation Links */}
      <div className="space-y-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
              window.location.pathname === link.path ? "bg-gray-700" : ""
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="ml-3 text-sm font-medium">{link.name}</span>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
