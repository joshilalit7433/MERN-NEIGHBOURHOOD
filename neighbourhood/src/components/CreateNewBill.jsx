import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth'; // Use getAuth for Firebase v9+
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx'; // Adjust path (note: corrected from 'Authcontext' to 'AuthContext')
import Sidebar from '../components/Sidebar'; // Import Sidebar component

export default function CreateNewBill() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    memberName: '',
    memberId: '',
    amount: '',
    dueDate: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Initialize Firebase Authentication (though not directly used here, included for consistency)
  const auth = getAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/register'); // Redirect to register if not authenticated
      return;
    }

    const fetchMembers = async () => {
      try {
        let membersQuery = query(
          collection(firestore, 'users'),
          orderBy('name')
        );

        if (searchQuery.trim()) {
          membersQuery = query(
            collection(firestore, 'users'),
            where('name', '>=', searchQuery.trim()),
            where('name', '<=', searchQuery.trim() + '\uf8ff'),
            orderBy('name')
          );
        }

        const querySnapshot = await getDocs(membersQuery);
        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          flat: doc.data().flatNo || 'N/A',
          contact: doc.data().contactNo || 'N/A',
        }));
        setSearchResults(membersData);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to fetch members. Please try again.');
      }
    };

    fetchMembers();

    // Cleanup (optional, but good practice)
    return () => {
      // No cleanup needed for this effect, but included for consistency
    };
  }, [user, loading, searchQuery, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectMember = (member) => {
    setFormData(prev => ({
      ...prev,
      memberName: member.name,
      memberId: member.id,
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.memberName.trim() || !formData.amount.trim() || !formData.dueDate.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      if (!user) {
        throw new Error('User not authenticated. Please log in or register.');
      }

      await addDoc(collection(firestore, 'bills'), {
        memberName: formData.memberName,
        memberId: formData.memberId,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'Pending',
      });

      setSuccess('Bill created successfully!');
      setFormData({
        memberName: '',
        memberId: '',
        amount: '',
        dueDate: '',
      });
      setTimeout(() => navigate('/billing'), 1000);
    } catch (error) {
      console.error('Error creating bill:', error);
      setError('Failed to create bill. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar />

      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-md mx-auto border-2 border-black rounded-lg p-6 bg-white">
          <h1 className="text-2xl font-bold mb-6 font-cursive">CREATE NEW BILL</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="memberName" className="block text-sm font-medium text-gray-700 font-cursive">
                Member NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="memberName"
                  name="memberName"
                  value={searchQuery || formData.memberName}
                  onChange={handleSearchChange}
                  className="mt-1 block w-full border-2 border-black rounded-md p-2 font-cursive focus:outline-none focus:ring-0"
                  placeholder="Search member..."
                />
                {searchResults.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border-2 border-black rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {searchResults.map((member) => (
                      <li
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="p-2 cursor-pointer hover:bg-gray-100 font-cursive"
                      >
                        {member.name} (Flat: {member.flat}, Contact: {member.contact})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 font-cursive">
                AMOUNT
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-cursive">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full border-2 border-black rounded-md p-2 pl-8 font-cursive focus:outline-none focus:ring-0"
                  placeholder="Enter amount"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 font-cursive">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1 block w-full border-2 border-black rounded-md p-2 font-cursive focus:outline-none focus:ring-0"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-500 text-white border-2 border-black rounded-md font-cursive hover:bg-blue-600 transition"
            >
              SUBMIT
            </button>
          </form>
          {(success || error) && (
            <p className={`text-center mt-4 ${success ? 'text-green-500' : 'text-red-500'}`}>
              {success || error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}