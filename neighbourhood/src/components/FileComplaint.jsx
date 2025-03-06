import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import { firestore } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ResidentSidebar from "./Resident/ResidentSidebar.jsx";

export default function FileComplaint() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    member: "",
    issue: "",
    flatNo: "",
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
          const userData = userDoc.data();
          setFormData((prev) => ({
            ...prev,
            member: userData.name || "Anonymous",
            flatNo: userData.flatNo || "Not provided",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            member: "Anonymous",
            flatNo: "Not provided",
          }));
        }
      } catch (err) {
        setFormError("Failed to fetch user data.");
      }
    };

    fetchUserData();
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
        flatNo: formData.flatNo,
        status: formData.status,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setFormSuccess("Complaint filed successfully!");
      setFormData({
        member: formData.member,
        issue: "",
        flatNo: formData.flatNo,
        status: "Pending",
      });
      navigate("/complaints");
    } catch (error) {
      setFormError("Failed to file complaint.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ResidentSidebar />
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">
            File a Complaint
          </h2>
          {formError && <p className="text-red-500 text-center">{formError}</p>}
          {formSuccess && <p className="text-green-500 text-center">{formSuccess}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member</label>
              <input
                type="text"
                name="member"
                value={formData.member}
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flat No</label>
              <input
                type="text"
                name="flatNo"
                value={formData.flatNo}
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-200 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue</label>
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your issue..."
                required
              ></textarea>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
