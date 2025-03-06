"use client"; // Mark as a Client Component since we use useState and Firebase hooks

import React, { useState } from "react";
import { auth, database } from "../firebaseConfig"; // Adjusted for your structure
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    flatNo: "",
    contactNo: "",
    email: "",
    password: "",
    role: "resident", // Default role
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      console.log("Attempting to register user with email:", formData.email);

      // Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log("User created with UID:", user.uid);

      // Update the user's profile
      await updateProfile(user, {
        displayName: formData.name,
      });

      console.log("User profile updated with name:", formData.name);

      // Store additional user data in Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        name: formData.name,
        flatNo: formData.flatNo,
        contactNo: formData.contactNo,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      console.log("User data stored in Realtime Database");

      setSuccess("User registered successfully!");
      setFormData({
        name: "",
        flatNo: "",
        contactNo: "",
        email: "",
        password: "",
        role: "resident",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register New User
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Fields */}
          {[
            { label: "Name", name: "name", type: "text", placeholder: "Enter name" },
            { label: "Flat No.", name: "flatNo", type: "text", placeholder: "Enter flat number" },
            { label: "Contact No.", name: "contactNo", type: "tel", placeholder: "Enter contact number" },
            { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
            { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="mt-1 flex space-x-4">
              {["resident", "member"].map((role) => (
                <label key={role} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-4 py-2 ${
                loading ? "bg-gray-400" : "bg-indigo-600"
              } text-white rounded-md hover:${
                loading ? "" : "bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );"use client"; // Mark as a Client Component since we use useState and Firebase hooks

import React, { useState } from "react";
import { auth, database } from "../firebaseConfig"; // Adjusted for your structure
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    flatNo: "",
    contactNo: "",
    email: "",
    password: "",
    role: "resident", // Default role
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      console.log("Attempting to register user with email:", formData.email);

      // Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log("User created with UID:", user.uid);

      // Update the user's profile
      await updateProfile(user, {
        displayName: formData.name,
      });

      console.log("User profile updated with name:", formData.name);

      // Store additional user data in Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        name: formData.name,
        flatNo: formData.flatNo,
        contactNo: formData.contactNo,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      console.log("User data stored in Realtime Database");

      setSuccess("User registered successfully!");
      setFormData({
        name: "",
        flatNo: "",
        contactNo: "",
        email: "",
        password: "",
        role: "resident",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Register New User
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Fields */}
          {[
            { label: "Name", name: "name", type: "text", placeholder: "Enter name" },
            { label: "Flat No.", name: "flatNo", type: "text", placeholder: "Enter flat number" },
            { label: "Contact No.", name: "contactNo", type: "tel", placeholder: "Enter contact number" },
            { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
            { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="mt-1 flex space-x-4">
              {["resident", "member"].map((role) => (
                <label key={role} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2 capitalize text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-4 py-2 text-white rounded-md transition-all duration-300 shadow-md ${
                loading ? "bg-gray-400" : "bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

}
