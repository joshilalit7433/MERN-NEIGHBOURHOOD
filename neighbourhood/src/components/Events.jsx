    // src/components/Events.jsx
    import { useState, useEffect } from 'react';
    import { Link } from 'react-router-dom'; // Import Link for navigation
    import { auth, firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
    import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
    import { onAuthStateChanged } from 'firebase/auth';

    export default function Events() {
    const [notices, setNotices] = useState([]); // State for notices from Firestore
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

    useEffect(() => {
        // Check authentication state
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user); // Set to true if a user is logged in
        if (!user) {
            // Redirect to login if not authenticated (use React Router or handle in App.jsx)
            window.location.href = '/login'; // Simple redirect (replace with Navigate if preferred)
        } else {
            // Fetch notices from Firestore if authenticated
            const fetchNotices = async () => {
            try {
                const noticesQuery = query(
                collection(firestore, 'notices'), // Query the 'notices' collection
                orderBy('createdAt', 'desc') // Order by creation date, newest first
                );
                const querySnapshot = await getDocs(noticesQuery);
                const noticesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                }));
                setNotices(noticesData);
            } catch (err) {
                console.error('Error fetching notices:', err);
                setError('Failed to fetch notices. Please try again.');
            } finally {
                setLoading(false);
            }
            };

            fetchNotices();
        }
        });

        // Cleanup subscription
        return () => unsubscribeAuth();
    }, [auth]);

    // Show loading or error if not authenticated or fetching data
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // Or a loading message (handled by redirect)
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">{error}</div>;
    }

    const handleDelete = async (noticeId) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
        try {
            await deleteDoc(doc(firestore, 'notices', noticeId));
            setNotices(notices.filter(notice => notice.id !== noticeId)); // Update state to remove the deleted notice
            console.log('Notice deleted successfully');
        } catch (err) {
            console.error('Error deleting notice:', err);
            setError('Failed to delete notice. Please try again.');
        }
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-10 text-gray-900">Events and Notices</h1>
        
        <Link
            to="/create-notice" // Link to the CreateNotice component
            className="lg:mb-[200px]mb-16 px-5 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-105"
        >
            Create New Event
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {notices.map((notice) => (
            <div
                key={notice.id}
                className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
                <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
                </div>
                <div className="p-6">
                <p className="text-gray-600 mb-3">Date: {notice.date}</p>
                <p className="text-gray-600 mb-5">Time: {notice.time}</p>
                <div className="flex justify-between items-center space-x-3">
                    <Link
                    to={`/notice/${notice.id}`} // Navigate to NoticeDetails with notice ID
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition transform hover:scale-105"
                    >
                    View Details
                    </Link>
                    <button
                    onClick={() => handleDelete(notice.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition transform hover:scale-105 text-xs"
                    >
                    Delete
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
    }