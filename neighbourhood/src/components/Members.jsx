import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate for logout
import { useAuth } from "../AuthContext.jsx";
import { firestore } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar"; // Import Sidebar

export default function Members({ setIsAuthenticated }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate(); // For navigation after logout
  const [memberList, setMemberList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const fetchMembers = async () => {
      try {
        console.log("Fetching members from Firestore...");
        const membersQuery = query(
          collection(firestore, "users"),
          orderBy("name", "asc")
        );
        const querySnapshot = await getDocs(membersQuery);
        console.log("Query Snapshot:", querySnapshot.docs);

        const membersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Anonymous",
          flat: doc.data().flatNo || "N/A",
          contact: doc.data().contactNo || "N/A",
        }));
        console.log("Members Data:", membersData);
        setMemberList(membersData);
      } catch (err) {
        console.error("Error fetching members:", err.message);
        setError(
          `Failed to fetch members. Please try again. Error: ${err.message}`
        );
      }
    };

    fetchMembers();
  }, [user, loading]);

  const handleDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        console.log("Deleting member with ID:", memberId);
        await deleteDoc(doc(firestore, "users", memberId));
        setMemberList(memberList.filter((member) => member.id !== memberId));
        console.log("Member deleted successfully");
      } catch (err) {
        console.error("Error deleting member:", err.message);
        setError(
          `Failed to delete member. Please try again. Error: ${err.message}`
        );
      }
    }
  };

  const handleLogout = () => {
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Member Management
          </h1>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Flat
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Contact
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => (
                  <tr key={member.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.name}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.flat}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.contact}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex space-x-2">
                        <Link
                          to={`/edit-member/${member.id}`}
                          className="px-3 py-1 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-100 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
