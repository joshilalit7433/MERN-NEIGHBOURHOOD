import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate for logout
import { firestore } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar"; // Import Sidebar

export default function Billing({ setIsAuthenticated }) {
  const navigate = useNavigate(); // For navigation after logout
  const [billList, setBillList] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const billsQuery = query(
          collection(firestore, "bills"),
          orderBy("dueDate")
        );
        const querySnapshot = await getDocs(billsQuery);

        const billsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          member: doc.data().memberName,
          amount: doc.data().amount,
          dueDate: doc.data().dueDate,
          status: doc.data().status,
        }));

        setBillList(billsData);
      } catch (err) {
        console.error("Error fetching bills:", err);
      }
    };

    fetchBills();

    return () => {};
  }, []);

  const handleStatusUpdate = async (billId, newStatus) => {
    try {
      const billRef = doc(firestore, "bills", billId);
      await updateDoc(billRef, { status: newStatus });

      setBillList(
        billList.map((bill) =>
          bill.id === billId ? { ...bill, status: newStatus } : bill
        )
      );
    } catch (err) {
      console.error("Error updating bill status:", err);
    }
  };

  const handleLogout = () => {
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Billing and Payments</h1>

        <Link
          to="/create-new-bill"
          className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Generate New Bill
        </Link>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border font-semibold text-left">
                  Member
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Amount
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Due Date
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Status
                </th>
                <th className="px-4 py-2 border font-semibold text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {billList.map((bill) => (
                <tr key={bill.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border">{bill.member}</td>
                  <td className="px-4 py-2 border">₹{bill.amount}</td>
                  <td className="px-4 py-2 border">
                    {new Date(bill.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      bill.status === "Paid"
                        ? "text-green-600"
                        : bill.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {bill.status}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(bill.id, "Pending")}
                      className={`px-3 py-1 border rounded-md transition ${
                        bill.status === "Pending"
                          ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(bill.id, "Paid")}
                      className={`px-3 py-1 border rounded-md transition ${
                        bill.status === "Paid"
                          ? "bg-green-200 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      Done
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(bill.id, "Overdue")}
                      className={`px-3 py-1 border rounded-md transition ${
                        bill.status === "Overdue"
                          ? "bg-red-200 text-red-800 border-red-300"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      Overdue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {billList.length === 0 && (
            <p className="text-center mt-4 text-gray-500">No bills found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
