import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, 
  doc 
} from 'firebase/firestore';

export default function Billing() {
  const [billList, setBillList] = useState([]); // Initialize as empty array for Firestore data

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // Query the bills collection, ordered by dueDate for consistency
        const billsQuery = query(collection(firestore, 'bills'), orderBy('dueDate'));
        const querySnapshot = await getDocs(billsQuery);

        // Map the Firestore documents to a format matching our table
        const billsData = querySnapshot.docs.map(doc => ({
          id: doc.id, // Use the document ID as the bill ID
          member: doc.data().memberName, // Match the field name from Firestore
          amount: doc.data().amount,
          dueDate: doc.data().dueDate, // Firestore stores this as ISO string
          status: doc.data().status,
        }));

        setBillList(billsData);
      } catch (err) {
        console.error('Error fetching bills:', err);
        // Optionally, set an error state or show a user-friendly message
      }
    };

    fetchBills();

    // Cleanup (optional, but good practice)
    return () => {
      // No cleanup needed for this effect, but included for consistency
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const handleStatusUpdate = async (billId, newStatus) => {
    try {
      const billRef = doc(firestore, 'bills', billId);
      await updateDoc(billRef, { status: newStatus });
      
      // Update the local state to reflect the change immediately
      setBillList(billList.map(bill => 
        bill.id === billId ? { ...bill, status: newStatus } : bill
      ));
    } catch (err) {
      console.error('Error updating bill status:', err);
      // Optionally, set an error state or show a user-friendly message
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Billing and Payments</h1>
      
      <Link
        to="/create-new-bill" // Navigate to the Create Bill page
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Generate New Bill
      </Link>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 shadow-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border font-semibold text-left">Member</th>
              <th className="px-4 py-2 border font-semibold text-left">Amount</th>
              <th className="px-4 py-2 border font-semibold text-left">Due Date</th>
              <th className="px-4 py-2 border font-semibold text-left">Status</th>
              <th className="px-4 py-2 border font-semibold text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {billList.map((bill) => (
              <tr key={bill.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 border">{bill.member}</td>
                <td className="px-4 py-2 border">₹{bill.amount}</td>
                <td className="px-4 py-2 border">
                  {new Date(bill.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
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
                    onClick={() => handleStatusUpdate(bill.id, 'Pending')}
                    className={`px-3 py-1 border rounded-md transition ${
                      bill.status === 'Pending'
                        ? 'bg-yellow-200 text-yellow-800 border-yellow-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(bill.id, 'Paid')}
                    className={`px-3 py-1 border rounded-md transition ${
                      bill.status === 'Paid'
                        ? 'bg-green-200 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Done
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(bill.id, 'Overdue')}
                    className={`px-3 py-1 border rounded-md transition ${
                      bill.status === 'Overdue'
                        ? 'bg-red-200 text-red-800 border-red-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
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
  );
}