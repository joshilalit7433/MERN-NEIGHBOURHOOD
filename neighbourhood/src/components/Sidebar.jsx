// src/components/Sidebar.jsx
import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext.jsx"; // Corrected import path
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
  Calendar,
  FileText,
  User, // Import User icon for Profile
} from "lucide-react"; // Import Lucide React icons

export default function Sidebar() {
  const { user, setUser } = useContext(AuthContext); // Access user and setUser from AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  const role = user && user.role ? user.role : null; // Get role, default to null if undefined
  console.log("Sidebar role:", role, "User:", user); // Debug log

  // Define sidebar links based on role
  const sidebarLinks = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="text-purple-400" />,
      path: role === "Committee Member" ? "/home" : "/resident-dashboard",
    },
    {
      name: "Members",
      icon: <Users className="text-purple-400" />,
      path: "/members",
      roles: ["Committee Member"], // Only for Committee Members
    },
    {
      name: "Add Member",
      icon: <UserPlus className="text-purple-400" />,
      path: "/register",
      roles: ["Committee Member"], // Only for Committee Members
    },
    {
      name: "Billing",
      icon: <DollarSign className="text-yellow-400" />, // Now shown for all users
      path: role === "Committee Member" ? "/billing" : "/resident-billing",
    },
    ...(role === "Committee Member"
      ? [
          {
            name: "Complaints",
            icon: <FileText className="text-blue-400" />,
            path: "/complaints",
          },
          {
            name: "File Complaint",
            icon: <FileText className="text-blue-400" />, // Using FileText for consistency
            path: "/file-complaint",
          },
        ]
      : []),
    {
      name: "Events and Notices",
      icon: <Calendar className="text-pink-400" />,
      path: "/events",
    },
    {
      name: "Profile",
      icon: <User className="text-green-400" />,
      path: role === "Committee Member" ? "/profile" : "/resident-profile",
    },
  ];

  const onLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Update AuthContext to clear user state
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  return (
    <div className="fixed h-screen bg-[#1f2a44] shadow-lg w-64 text-white overflow-hidden">
      {/* Logo/Title */}
      <div className="mb-8 p-4">
        <h1 className="text-2xl font-bold uppercase">Dashboard</h1>
      </div>

      {/* Navigation Links */}
      <div className="space-y-2">
        {sidebarLinks.map((link) => {
          // Filter links based on role (if roles array is specified)
          if (link.roles && !link.roles.includes(role)) return null;

          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                location.pathname === link.path ? "bg-gray-700" : ""
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="ml-3 text-sm font-medium">{link.name}</span>
            </Link>
          );
        })}
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
