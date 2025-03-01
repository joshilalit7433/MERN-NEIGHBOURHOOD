import { useNavigate } from "react-router-dom";
import { useState } from "react";

const MembersDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    pendingComplaints: 2,
    unpaidBills: 2000,
    upcomingEvents: "Community Meeting on June 25",
    notices: ["Water supply disruption on June 5", "New parking rules applied"],
  });

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Welcome back, Member!</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm">
          Logout
        </button>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pending Complaints */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold">Pending Complaints</h2>
          <p className="text-2xl font-bold">{data.pendingComplaints}</p>
        </div>

        {/* Unpaid Bills */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold">Unpaid Bills</h2>
          <p className="text-2xl font-bold">₹{data.unpaidBills}</p>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <p className="text-lg">{data.upcomingEvents}</p>
        </div>
      </div>

      {/* Notices Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Notices</h2>
        {data.notices.map((notice, index) => (
          <p key={index} className="border-b py-2">{notice}</p>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Emergency Contacts</h2>
        <p>🔹 Society Manager: +91 98765 43210</p>
        <p>🔹 Security Guard: +91 87654 32109</p>
      </div>
    </div>
  );
};

export default MembersDashboard;
