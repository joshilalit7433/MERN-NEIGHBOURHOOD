import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import Sidebar from "../components/Sidebar";

const MembersDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    pendingComplaints: 0,
    unpaidBills: 0,
    upcomingEvents: "",
    pastNotices: [],
  });

  // Fetch Pending Complaints
  const fetchPendingComplaints = async () => {
    try {
      const q = query(
        collection(firestore, "complaints"),
        where("status", "==", "Pending")
      );
      const querySnapshot = await getDocs(q);
      setData((prev) => ({
        ...prev,
        pendingComplaints: querySnapshot.size,
      }));
    } catch (err) {
      console.error("Failed to fetch pending complaints:", err);
    }
  };

  // Fetch Unpaid or Overdue Bills
  const fetchUnpaidBills = async () => {
    try {
      const q = query(
        collection(firestore, "bills"),
        where("status", "in", ["Pending", "Overdue"])
      );
      const querySnapshot = await getDocs(q);

      let totalUnpaid = 0;
      querySnapshot.forEach((doc) => {
        totalUnpaid += doc.data().amount;
      });

      setData((prev) => ({
        ...prev,
        unpaidBills: totalUnpaid,
      }));
    } catch (err) {
      console.error("Failed to fetch unpaid/overdue bills:", err);
    }
  };

  // Fetch Events / Notices
  const fetchEvents = async () => {
    try {
      const q = query(
        collection(firestore, "notices"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const notices = querySnapshot.docs.map((doc) => doc.data());

      if (notices.length > 0) {
        const upcoming = `${notices[0].title} on ${notices[0].date}`;
        const past = notices
          .slice(1)
          .map((notice) => `${notice.title} on ${notice.date}`);

        setData((prev) => ({
          ...prev,
          upcomingEvents: upcoming,
          pastNotices: past,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch events/notices:", err);
    }
  };

  useEffect(() => {
    fetchPendingComplaints();
    fetchUnpaidBills();
    fetchEvents();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-grow p-6 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome back, Member!</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Pending Complaints
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              {data.pendingComplaints}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Unpaid Bills
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              ₹{data.unpaidBills}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Upcoming Events/Notices
            </h2>
            <p className="text-lg text-gray-900">
              {data.upcomingEvents || "No upcoming events/notices"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Past Events / Notices
          </h2>
          {data.pastNotices.length > 0 ? (
            data.pastNotices.map((notice, index) => (
              <p
                key={index}
                className="border-b border-gray-200 py-2 text-gray-800"
              >
                {notice}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No past notices available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersDashboard;
