import { useState } from "react";

const initialRequests = [
  { id: 1, member: "John Doe", issue: "Leaking tap", status: "Pending" },
  { id: 2, member: "Jane Smith", issue: "Electrical fault", status: "In Progress" },
  { id: 3, member: "Bob Johnson", issue: "Broken window", status: "Completed" },
];

export default function Maintenance() {
  const [requests, setRequests] = useState(initialRequests);

  const updateStatus = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: "Completed" } : req
      )
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>
      
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        New Request
      </button>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 shadow-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Member</th>
              <th className="px-4 py-2 border">Issue</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 border">{request.member}</td>
                <td className="px-4 py-2 border">{request.issue}</td>
                <td
                  className={`px-4 py-2 border font-semibold ${
                    request.status === "Completed"
                      ? "text-green-600"
                      : request.status === "In Progress"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {request.status}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => updateStatus(request.id)}
                    className="px-3 py-1 border border-gray-500 rounded-md hover:bg-gray-100 transition disabled:opacity-50"
                    disabled={request.status === "Completed"}
                  >
                    Update Status
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
