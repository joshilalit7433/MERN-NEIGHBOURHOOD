import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import { firestore } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Complaints({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    member: "",
    issue: "",
    status: "Pending",
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/register");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setFormData((prev) => ({
            ...prev,
            member: userDoc.data().name || "Anonymous",
          }));
        } else {
          setFormData((prev) => ({ ...prev, member: "Anonymous" }));
        }
      } catch (err) {
        setError("Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/register");
      return;
    }

    const fetchComplaints = async () => {
      try {
        const complaintsQuery = query(
          collection(firestore, "complaints"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(complaintsQuery);
        const complaintsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          member: doc.data().name || "Anonymous",
          issue: doc.data().description || "No issue provided",
          status: doc.data().status || "Pending",
        }));
        setComplaints(complaintsData);
      } catch (err) {
        setError("Failed to fetch complaints.");
      }
    };

    fetchComplaints();
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.issue.trim()) {
      setFormError("Issue description is required.");
      return;
    }

    try {
      await addDoc(collection(firestore, "complaints"), {
        name: formData.member,
        description: formData.issue,
        status: formData.status,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setFormSuccess("Complaint filed successfully!");
      setFormData({ member: formData.member, issue: "", status: "Pending" });
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Failed to file complaint.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar />

      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Complaints</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 border border-black rounded-md"
            >
              File Complaint
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Member</th>
                  <th className="px-4 py-2 border">Issue</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="px-4 py-2 border">{complaint.member}</td>
                      <td className="px-4 py-2 border">{complaint.issue}</td>
                      <td
                        className={`px-4 py-2 border font-semibold ${
                          complaint.status === "Pending"
                            ? "text-red-600"
                            : complaint.status === "In Progress"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {complaint.status}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-4">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">
              File Complaint
            </h2>
            {formError && (
              <p className="text-red-500 text-center mb-4">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-green-500 text-center mb-4">{formSuccess}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                className="w-full border p-2 h-32"
                placeholder="Describe your issue..."
                required
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 border border-black rounded-md"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-black rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
