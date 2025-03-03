import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const MembersDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    pendingComplaints: 2,
    unpaidBills: 2000,
    upcomingEvents: "Community Meeting on June 25",
    notices: ["Water supply disruption on June 5", "New parking rules applied"],
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-grow p-6 lg:ml-64">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome back, Member!</h1>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Pending Complaints */}
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Pending Complaints
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              {data.pendingComplaints}
            </p>
          </div>

          {/* Unpaid Bills */}
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Unpaid Bills
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              ₹{data.unpaidBills}
            </p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-900">{data.upcomingEvents}</p>
          </div>
        </div>

        {/* Notices Section */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Notices
          </h2>
          {data.notices.map((notice, index) => (
            <p
              key={index}
              className="border-b border-gray-200 py-2 text-gray-800"
            >
              {notice}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersDashboard;
