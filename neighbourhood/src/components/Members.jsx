import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Authcontext.jsx'; // Adjust path to match your project structure
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

export default function Members() {
  const { user, loading } = useAuth(); // Use auth context for user data
  const [memberList, setMemberList] = useState([]); // State for members from Firestore
  const [error, setError] = useState(null); // Error state

  // Fetch members (users) from Firestore
  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/login'; // Redirect to login if not authenticated
      return;
    }

    const fetchMembers = async () => {
      try {
        console.log('Fetching members from Firestore...'); // Debug log
        const membersQuery = query(
          collection(firestore, 'users'), // Query the 'users' collection
          orderBy('name', 'asc') // Order by name alphabetically (optional, adjust as needed)
        );
        const querySnapshot = await getDocs(membersQuery);
        console.log('Query Snapshot:', querySnapshot.docs); // Debug log

        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          flat: doc.data().flatNo || 'N/A', // Use flatNo from your screenshot
          contact: doc.data().contactNo || 'N/A', // Use contactNo from your screenshot
        }));
        console.log('Members Data:', membersData); // Debug log
        setMemberList(membersData);
      } catch (err) {
        console.error('Error fetching members:', err.message); // Log the specific error
        setError(`Failed to fetch members. Please try again. Error: ${err.message}`);
      }
    };

    fetchMembers();
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">
        {error}
      </div>
    );
  }

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        console.log('Deleting member with ID:', memberId); // Debug log
        await deleteDoc(doc(firestore, 'users', memberId));
        setMemberList(memberList.filter(member => member.id !== memberId));
        console.log('Member deleted successfully');
      } catch (err) {
        console.error('Error deleting member:', err.message);
        setError(`Failed to delete member. Please try again. Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Member Management</h1>
      
        <Link
          to="/add-member"
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add New Member
        </Link>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">Name</th>
                <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">Flat</th>
                <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">Contact</th>
                <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => (
                <tr key={member.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border-b text-gray-800">{member.name}</td>
                  <td className="px-4 py-2 border-b text-gray-800">{member.flat}</td>
                  <td className="px-4 py-2 border-b text-gray-800">{member.contact}</td>
                  <td className="px-4 py-2 border-b">
                    <div className="flex space-x-2">
                      <Link
                        to={`/edit-member/${member.id}`}
                        className="px-3 py-1 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-100 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}