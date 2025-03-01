// src/components/Register.jsx
import React, { useState } from 'react';
import { auth, firestore } from '../firebaseConfig'; // Ensure lowercase 'firestore'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    flatNo: '',
    contactNo: '',
    email: '',
    password: '',
    role: 'resident', // Default role
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state for better UX

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
      console.log('Attempting to register user with email:', formData.email);
      
      // Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      console.log('User created with UID:', user.uid);

      // Update the user's profile (optional, e.g., to set displayName)
      await updateProfile(user, {
        displayName: formData.name,
      });

      console.log('User profile updated with name:', formData.name);

      // Store additional user data in Firestore under 'users' collection
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        flatNo: formData.flatNo,
        contactNo: formData.contactNo,
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      console.log('User data stored in Firestore');

      setSuccess('User registered successfully!');
      setFormData({
        name: '',
        flatNo: '',
        contactNo: '',
        email: '',
        password: '',
        role: 'resident',
      });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register New User</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter name"
              required
            />
          </div>

          {/* Flat No. Input */}
          <div>
            <label htmlFor="flatNo" className="block text-sm font-medium text-gray-700">
              Flat No.
            </label>
            <input
              type="text"
              id="flatNo"
              name="flatNo"
              value={formData.flatNo}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter flat number"
              required
            />
          </div>

          {/* Contact No. Input */}
          <div>
            <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700">
              Contact No.
            </label>
            <input
              type="tel"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter contact number"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter email"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  id="resident"
                  name="role"
                  value="resident"
                  checked={formData.role === 'resident'}
                  onChange={handleChange}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Resident</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  id="member"
                  name="role"
                  value="member"
                  checked={formData.role === 'member'}
                  onChange={handleChange}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Member</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-indigo-600'} text-white rounded-md hover:${loading ? '' : 'bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}