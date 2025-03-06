import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext.jsx"; // Adjust path as needed
import { firestore } from "../../firebaseConfig.js"; // Adjust path as needed
import { collection, getDocs, query, where } from "firebase/firestore";
import ResidentSidebar from "./ResidentSidebar"; // Import the Sidebar (adjust path as needed)

const ResidentBilling = () => {
  const { user, loading } = useAuth();
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      return;
    }

    const fetchBills = async () => {
      try {
        const userName = user.displayName || user.email.split("@")[0];

        const billsQuery = query(
          collection(firestore, "bills"),
          where("memberName", "==", userName)
        );
        const querySnapshot = await getDocs(billsQuery);
        const billsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBills(billsData);
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to fetch bills. Please try again.");
      }
    };

    fetchBills();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ResidentSidebar />
      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-purple-600 mb-4">
            My Bills
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <th className="py-3 px-4 text-center">Member</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4 text-center">{bill.memberName}</td>
                    <td className="py-3 px-4 text-center">₹{bill.amount}</td>
                    <td className="py-3 px-4 text-center">
                      {new Date(bill.dueDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-white font-medium ${
                          bill.status === "Paid" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`/payment-link/${bill.id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      >
                        Pay
                      </a>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-3 px-4 text-center text-gray-500"
                    >
                      No bills found for your account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentBilling;
