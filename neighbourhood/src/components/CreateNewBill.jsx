import React, { useState } from 'react';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  auth 
} from 'firebase/auth'; // Import RecaptchaVerifier and phone auth functions
import { firestore } from '../firebaseConfig'; // Adjust the path to your Firebase config
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Authcontext'; // Adjust path

export default function Login({ setIsAuthenticated }) {
  const [phoneNumber, setPhoneNumber] = useState(''); // State for phone number
  const [verificationCode, setVerificationCode] = useState(''); // State for verification code
  const [error, setError] = useState(null); // Error state
  const [success, setSuccess] = useState(null); // Success state
  const [confirmationResult, setConfirmationResult] = useState(null); // Store confirmation result for verification
  const [showVerification, setShowVerification] = useState(false); // Toggle between phone input and code input
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Get setUser from AuthContext

  // Initialize reCAPTCHA verifier
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible', // Use invisible reCAPTCHA (can also use 'normal' for visible)
        callback: (response) => {
          console.log('reCAPTCHA verified:', response);
        },
        'expired-callback': () => {
          setError('reCAPTCHA verification expired. Please try again.');
        },
      }, auth);
    }
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number.');
      return;
    }

    try {
      const formattedPhone = `+91${phoneNumber}`; // Adjust country code as needed (e.g., +91 for India)
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setShowVerification(true);
      setSuccess('Verification code sent to your phone. Please enter it below.');
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please check the phone number and try again.');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      setUser(user); // Update AuthContext with the authenticated user
      setIsAuthenticated(true); // Update parent state if needed
      navigate('/'); // Redirect to home or another page after login
      setSuccess('Successfully logged in!');
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        
        <div id="recaptcha-container"></div> {/* Container for reCAPTCHA */}

        {!showVerification ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your phone number (e.g., 9876543210)"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Verification Code
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter the 6-digit code"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verify Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}