import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { firestore, auth } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import Sidebar from '../components/Sidebar';

export default function Members({ setIsAuthenticated }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memberList, setMemberList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const fetchMembers = async () => {
      try {
        const membersQuery = query(
          collection(firestore, 'users'),
          orderBy('name', 'asc')
        );
        const querySnapshot = await getDocs(membersQuery);

        const membersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Anonymous',
          flat: doc.data().flatNo || 'N/A',
          contact: doc.data().contactNo || 'N/A',
          role: doc.data().role || 'Member',
        }));
        setMemberList(membersData);
      } catch (err) {
        setError(`Failed to fetch members. Please try again. Error: ${err.message}`);
      }
    };

    fetchMembers();
  }, [user, loading]);

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(firestore, 'users', memberId));
        setMemberList(memberList.filter(member => member.id !== memberId));
      } catch (err) {
        setError(`Failed to delete member. Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Member Management</h1>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 shadow-md">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-2 border-b font-semibold text-left">Name</th>
                  <th className="px-4 py-2 border-b font-semibold text-left">Flat</th>
                  <th className="px-4 py-2 border-b font-semibold text-left">Contact</th>
                  <th className="px-4 py-2 border-b font-semibold text-left">Role</th>
                  <th className="px-4 py-2 border-b font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => (
                  <tr key={member.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border-b">{member.name}</td>
                    <td className="px-4 py-2 border-b">{member.flat}</td>
                    <td className="px-4 py-2 border-b">{member.contact}</td>
                    <td className="px-4 py-2 border-b">{member.role}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {memberList.length === 0 && (
              <p className="text-center mt-4 text-gray-500">No members found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
