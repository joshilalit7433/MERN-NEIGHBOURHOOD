import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate for navigation
import { auth } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true); // State for mobile toggle (optional)
  const navigate = useNavigate(); // For programmatic navigation on logout

  const sidebarLinks = [
    { name: 'Dashboard', icon: '🏠', path: '/' },
    { name: 'Members', icon: '👥', path: '/members' },
    { name: 'Add Member', icon: '➕', path: '/register' }, // Added "Add Member" link
    { name: 'Billing', icon: '💰', path: '/billing' },
    { name: 'Events and Notices', icon: '🎉', path: '/events' },
    { name: 'Complaints', icon: '📄', path: '/complaints' }, // Updated to "Complaints" only
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase Authentication
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fixed h-screen bg-gray-900 shadow-lg w-64 p-4 text-white">
      {/* Logo/Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Navigation Links */}
      <div className="space-y-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center p-2 rounded-lg hover:bg-gray-700 hover:text-white ${
              window.location.pathname === link.path ? 'bg-gray-700' : ''
            }`}
          >
            <span className="mr-3 text-xl">{link.icon}</span>
            <span className="text-sm font-medium">{link.name}</span>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Optional: Mobile Toggle Button (hidden on desktop) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 bg-gray-800 text-white rounded-lg fixed top-4 left-4 z-50"
      >
        {isOpen ? '✖' : '☰'}
      </button>
    </div>
  );
}