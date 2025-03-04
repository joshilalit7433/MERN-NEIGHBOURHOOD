// ResidentBilling.jsx
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
      // Redirect or handle unauthenticated users (handled by App.jsx)
      return;
    }

    const fetchBills = async () => {
      try {
        // Get the user's name from the auth context or user object
        const userName = user.displayName || user.email.split("@")[0]; // Adjust based on how you store user names

        // Query Firestore for bills where memberName matches the logged-in user's name
        const billsQuery = query(
          collection(firestore, "bills"),
          where("memberName", "==", userName) // Match bills by memberName
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
      <ResidentSidebar /> {/* Sidebar for layout consistency */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">
            Resident Billing
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b text-center">Member</th>
                <th className="py-2 px-4 border-b text-center">Amount</th>
                <th className="py-2 px-4 border-b text-center">Due Date</th>
                <th className="py-2 px-4 border-b text-center">Status</th>
                <th className="py-2 px-4 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">
                    {bill.memberName}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    ₹{bill.amount}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {new Date(bill.dueDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <span
                      className={`font-medium ${
                        bill.status === "Paid"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <a
                      href={`/payment-link/${bill.id}`} // Replace with your actual payment link or route, including bill ID
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 inline-block"
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
                    className="py-2 px-4 border-b text-center text-gray-500"
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
  );
};

export default ResidentBilling;
