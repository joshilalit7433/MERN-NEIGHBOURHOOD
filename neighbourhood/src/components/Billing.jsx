import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const bills = [
  { id: 1, member: "John Doe", amount: 1000, dueDate: "2023-07-15", status: "Paid" },
  { id: 2, member: "Jane Smith", amount: 1200, dueDate: "2023-07-15", status: "Pending" },
  { id: 3, member: "Bob Johnson", amount: 800, dueDate: "2023-07-15", status: "Overdue" },
];

export default function Billing() {
  const [billList, setBillList] = useState(bills); // Add state for potential future updates

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
                <td className="px-4 py-2 border">{bill.dueDate}</td>
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
                <td className="px-4 py-2 border">
                  <button className="px-3 py-1 border border-gray-500 rounded-md hover:bg-gray-100 transition">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}