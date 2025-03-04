import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate for logout
import { useAuth } from '../AuthContext.jsx'; // Corrected path
import { firestore, auth } from '../firebaseConfig'; // Adjusted to import both firestore and auth
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth'; // Import deleteUser for Firebase Authentication
import Sidebar from '../components/Sidebar'; // Import Sidebar

export default function Members({ setIsAuthenticated }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate(); // For navigation after logout
  const [memberList, setMemberList] = useState([]);
  const [error, setError] = useState(null);

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
          flat: doc.data().flatNo || 'N/A', // Use flatNo from Firestore
          contact: doc.data().contactNo || 'N/A', // Use contactNo from Firestore
          role: doc.data().role || 'Member', // Use role from Firestore, default to 'Member'
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

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        console.log('Deleting member with ID:', memberId); // Debug log

        // Delete the user from Firestore
        await deleteDoc(doc(firestore, 'users', memberId));

        // Delete the user from Firebase Authentication
        const authInstance = getAuth(); // Get the Firebase Authentication instance
        const userToDelete = authInstance.currentUser; // Get the current authenticated user (for checking permissions)

        if (userToDelete && userToDelete.uid === memberId) {
          // If the user trying to delete is themselves, log them out and delete their account
          await deleteUser(userToDelete);
          if (setIsAuthenticated) {
            setIsAuthenticated(false); // Update authentication state
          }
          navigate('/login'); // Redirect to login after deletion
          console.log('Member and Firebase Authentication user deleted successfully');
        } else {
          // If deleting another user, we need their Firebase Authentication UID
          // Fetch the user data from Firestore to get the UID (createdBy or uid field)
          const memberDoc = await getDoc(doc(firestore, 'users', memberId));
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            const authUid = memberData.uid || memberData.createdBy; // Use uid or createdBy (adjust based on your Firestore structure)
            if (authUid) {
              const authUser = await authInstance.getUser(authUid); // Get the user from Firebase Authentication
              await deleteUser(authUser); // Delete the user from Firebase Authentication
              console.log('Member and Firebase Authentication user deleted successfully');
            } else {
              throw new Error('User UID not found in Firestore for deletion from Authentication.');
            }
          } else {
            throw new Error('Member not found in Firestore.');
          }
        }

        // Update local state to remove the deleted member
        setMemberList(memberList.filter(member => member.id !== memberId));
      } catch (err) {
        console.error('Error deleting member:', err.message);
        setError(`Failed to delete member and their Firebase Authentication account. Please try again. Error: ${err.message}`);
      }
    }
  };

  const handleLogout = () => {
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-grow p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Member Management
          </h1>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Flat
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Contact
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-2 border-b font-semibold text-left text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => (
                  <tr key={member.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.name}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.flat}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.contact}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-800">
                      {member.role || 'Member'}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex space-x-2">
                        {/* Removed Edit button */}
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
            {memberList.length === 0 && (
              <p className="text-center mt-4 text-gray-500">No members found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}