    // src/components/NoticeDetails.jsx
    import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { auth, firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
    import { doc, getDoc } from 'firebase/firestore';
    import { onAuthStateChanged } from 'firebase/auth';

    export default function NoticeDetails() {
    const { noticeId } = useParams(); // Get the notice ID from the URL
    const [notice, setNotice] = useState(null); // State for notice data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user); // Set to true if a user is logged in
        if (!user) {
            navigate('/login'); // Redirect to login if not authenticated
        } else {
            // Fetch notice details from Firestore
            const fetchNotice = async () => {
            try {
                const noticeDoc = await getDoc(doc(firestore, 'notices', noticeId));
                if (noticeDoc.exists()) {
                setNotice(noticeDoc.data());
                } else {
                setError('Notice not found.');
                }
            } catch (err) {
                console.error('Error fetching notice details:', err);
                setError('Failed to fetch notice details. Please try again.');
            } finally {
                setLoading(false);
            }
            };

            fetchNotice();
        }
        });

        return () => unsubscribeAuth();
    }, [auth, navigate, noticeId]);

    // Show loading or error if not authenticated or fetching data
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // Or a loading message (handled by redirect)
    }

    if (error || !notice) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">{error || 'Notice not found.'}</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Notice Details</h2>
            <div className="space-y-4">
            <p className="text-gray-700"><strong>Title:</strong> {notice.title}</p>
            <p className="text-gray-700"><strong>Notice by:</strong> {notice.name}</p>
            <p className="text-gray-700"><strong>Date:</strong> {notice.date}</p>
            <p className="text-gray-700"><strong>Time:</strong> {notice.time}</p>
            <p className="text-gray-700"><strong>Description:</strong> {notice.description}</p>
            </div>
            <div className="text-center mt-6">
            <button
                onClick={() => navigate('/events')} // Back to Events page
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
                Back to Events
            </button>
            </div>
        </div>
        </div>
    );
    }