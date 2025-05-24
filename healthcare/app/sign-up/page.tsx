'use client';

import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { useRouter } from 'next/navigation';
import { doc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from "firebase/auth";

type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('prefer-not-to-say');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const router = useRouter();

  // Function to get the next serial number
  const getNextUserSerial = async () => {
    const counterRef = doc(db, 'counters', 'users');
    try {
      const serialNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
        const newCount = currentCount + 1;
        transaction.set(counterRef, { count: newCount });
        return newCount;
      });
      return serialNumber;
    } catch (error) {
      console.error("Transaction failed: ", error);
      return 0; // Fallback value
    }
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true); // Start loading animation

    if (!name.trim()) {
      setError('Name is required.');
      setLoading(false); // Stop loading if validation fails
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one number, and one special character (e.g., !@#$%^&*).');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign up with email:', email);
      // Create the user in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (!res || !res.user) {
        throw new Error('User creation failed');
      }

      const user = res.user;
      
      console.log('User created with UID:', user.uid);
      // Get the next serial number
      const serialNo = await getNextUserSerial();
      console.log('Serial number assigned:', serialNo);

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        serialNo: serialNo,
        uid: user.uid,
        name: name.trim(),
        email: email.toLowerCase(),
        gender: gender,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'active',
        role: 'user',
        emailVerified: false,
        profileComplete: false,
        accountType: 'standard',
        loginCount: 0,
        metadata: {
          signUpMethod: 'email',
          ipAddress: '',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
        }
      });

      // Also create a record in the registrations collection
      await setDoc(doc(db, "registrations", user.uid), {
        serialNo: serialNo,
        userId: user.uid,
        name: name.trim(),
        email: email,
        password: password,
        gender: gender,
        registeredAt: serverTimestamp(),
        initialUserAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        referralSource: 'direct'
      });

      console.log('User data saved to Firestore');
      // Clear form and redirect
      sessionStorage.setItem('user', 'true');
      setName('');
      setEmail('');
      setPassword('');
      setGender('prefer-not-to-say');
      router.push('/sign-in');
    
    } catch (e: any) {
      console.error("Signup Error:", e);
    
      if (e.code) {
        switch (e.code) {
          case 'auth/email-already-in-use':
            setError('This email is already in use. Please use a different one.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters.');
            break;
          case 'auth/network-request-failed':
            setError('Network error. Please check your internet connection and try again.');
            break;
          default:
            setError(e.message || 'Something went wrong. Please try again.');
        }
      } else {
        setError(e.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false); // Stop loading animation after success or error
    }
  };

  return (
    <div className="min-h-screen bg-[##C69749] flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl w-full min-h-screen">
        {/* Left - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 text-[#282A3A]">
        
         <div className="flex items-start mb-4">
            <Link 
              href="http://localhost:3000" 
              className="text-[#C69749] border px-2 py-0.5 rounded-md hover:bg-[#735F32] transition"
            >
              🡸
            </Link>

            <h2 className="text-2xl font-bold text-[#C69749] text-[5vh] px-6 "> Create Account</h2>
          </div>
          <p className="text-[#735F32] mb-2 leading-normal">Start your journey with us. Join and get full access to amazing features.</p>

          <div className="mb-2">
            <label className="block text-sm mb-1 text-[#282A3A]">Full Name:</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-[#735F32] bg-transparent text-[#282A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder-[#735F32]"
              disabled={loading} // Disable input during loading
            />
          </div>

          <label className="block text-sm mb-1 text-[#000000]">Gender:</label>
          <div className="grid grid-cols-5 gap-2">
            {(['male', 'female', 'other'] as Gender[]).map((option) => (
              <label
                key={option}
                className={`flex items-center gap-2 cursor-pointer ${
                  gender === option
                    ? ''
                    : 'bg-transparent text-[#000000]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} // Disable gender selection during loading
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={gender === option}
                  onChange={() => setGender(option)}
                  className="accent-[#000000]"
                  disabled={loading}
                />
                {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
              </label>
            ))}
          </div>

          <div className="mb-2">
            <label className="block text-sm mb-1 text-[#282A3A]">Email:</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#735F32] bg-transparent text-[#282A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder-[#735F32]"
              disabled={loading}
            />
          </div>

          <div className="mb-2">
            {/* Empty div for spacing consistency */}
          </div>

          <div className="mb-2 relative">
            <label className="block text-sm mb-1 text-[#282A3A]">Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters, ie. JhonDoe@008"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-[#735F32] bg-transparent text-[#282A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder-[#735F32]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-10 transform -translate-y-1/2 text-[#735F32] hover:text-[#C69749] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

          <button
            onClick={handleSignUp}
            className={`w-full bg-[#C69749] hover:bg-[#735F32] text-black font-semibold py-3 rounded-lg transition flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h-8z"
                  />
                </svg>
                Signing Up...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="my-5 flex items-center justify-center">
            <hr className="flex-grow border-[#735F32]" />
            <span className="mx-2 text-[#735F32] text-sm">or</span>
            <hr className="flex-grow border-[#735F32]" />
          </div>

          <div className="space-y-3">
            <button
              className={`w-full flex items-center justify-center gap-2 bg-transparent border border-[#735F32] py-2 rounded-lg hover:bg-[#f4f4f4] text-[#282A3A] transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <FcGoogle size={20} />
              <span className="text-sm">Sign in with Google</span>
            </button>
            <button
              className={`w-full flex items-center justify-center gap-2 bg-transparent border border-[#735F32] py-2 rounded-lg hover:bg-[#f4f4f4] text-[#282A3A] transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <FaFacebook size={20} className="text-[#1877F2]" />
              <span className="text-sm">Sign in with Facebook</span>
            </button>
          </div>

          <p className="text-center text-sm text-[#735F32] mt-2">
            Already have an account?{' '}
            <a href="/sign-in" className="text-[#C69749] hover:underline">
              Sign in
            </a>
          </p>

          <p className="text-center text-xs text-[#735F32] mt-4">© 2025 ALL RIGHTS RESERVED TO ITP</p>
        </div>

        {/* Right - Image */}
        <div className="hidden lg:block w-1/2">
          <img
            src="/signin9.jpg"
            alt="Sign up visual"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;