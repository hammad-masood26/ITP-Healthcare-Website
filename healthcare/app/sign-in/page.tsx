'use client';

import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { useRouter } from 'next/navigation';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp, runTransaction, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [signInWithEmailAndPassword, user, authLoading, authError] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  // Function to get next serial number
  const getNextLoginSerial = async () => {
    const counterRef = doc(db, 'counters', 'user_logins');
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

  const handleSignIn = async () => {
    setError('');
    setLoading(true); // Start loading animation

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address format.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting sign-in with email:', email);
      // Authenticate user
      const res = await signInWithEmailAndPassword(email, password);

      if (authError) {
        console.log('Authentication error:', authError.code, authError.message);
        switch (authError.code) {
          case 'auth/user-not-found':
            setError('User not found. Try a different one or create an account.');
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Invalid email or password.');
            break;
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          default:
            setError(authError.message || 'An authentication error occurred.');
        }
        setLoading(false); // Ensure loading stops on auth error
        return;
      }

      if (res?.user) {
        console.log('User authenticated:', res.user.uid);
        // Fetch user role from Firestore
        const userDocRef = doc(db, 'users', res.user.uid);
        const userDoc = await getDoc(userDocRef);
        let userRole = 'user'; // Default role

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userRole = userData.role || 'user'; // Use role from Firestore
        } else {
          throw new Error('User data not found in Firestore.');
        }

        // Log the login
        const serialNo = await getNextLoginSerial();
        console.log('Login serial number:', serialNo);
        await addDoc(collection(db, `${userRole}_logins`), {
          serialNo,
          email,
          userId: res.user.uid,
          timestamp: serverTimestamp(),
          role: userRole,
        });

        // Set session and redirect
        sessionStorage.setItem('userRole', userRole);
        router.push(userRole === 'admin' ? '/admin_panel' : '/');
      }
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || 'An unexpected error occurred.');
      setLoading(false); // Ensure loading stops on catch
    } finally {
      setLoading(false); // Guarantee loading stops in all cases
    }
  };

  return (
    <div className="min-h-screen bg-[##69749] flex items-center justify-center p-2">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl w-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 text-[#282A3A]">
          <div className="flex items-start mb-4">
            <Link
              href="http://localhost:3000"
              className="text-[#C69749] border px-2 py-0.5 rounded-md hover:bg-[#735F32] transition"
            >
              🡸
            </Link>
            <h2 className="text-2xl font-bold text-[#C69749] text-[5vh] px-6">Welcome Back</h2>
          </div>
          <p className="text-[#735F32] mb-6">
            Sign in to access your account and get started.
          </p>

          <div className="mb-4">
            <label className="block text-sm mb-1 text-[#282A3A]">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#735F32] bg-transparent text-[#282A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder-[#735F32]"
              disabled={loading || authLoading}
            />
          </div>

          <div className="mb-2 relative">
            <label className="block text-sm mb-1 text-[#282A3A]">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="ie. JhonDoe@008"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-[#735F32] bg-transparent text-[#282A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder-[#735F32]"
              disabled={loading || authLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-10 transform -translate-y-1/2 text-[#735F32] hover:text-[#C69749] ${loading || authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || authLoading}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          <div className="text-right mb-6">
            <a href="#" className="text-sm hover:underline text-[#C69749]">
              Forgot Password?
            </a>
          </div>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          <button
            onClick={handleSignIn}
            disabled={loading || authLoading}
            className={`w-full bg-[#C69749] hover:bg-[#735F32] text-black font-semibold py-3 rounded-lg transition flex items-center justify-center ${loading || authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {(loading || authLoading) ? (
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
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="my-5 flex items-center justify-center">
            <hr className="flex-grow border-[#735F32]" />
            <span className="mx-2 text-[#735F32] text-sm">or</span>
            <hr className="flex-grow border-[#735F32]" />
          </div>

          <div className="space-y-3">
            <button
              className={`w-full flex items-center justify-center gap-2 bg-transparent border border-[#735F32] py-2 rounded-lg hover:bg-[#f4f4f4] text-[#282A3A] transition ${loading || authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || authLoading}
            >
              <FcGoogle size={20} />
              <span className="text-sm">Sign in with Google</span>
            </button>
            <button
              className={`w-full flex items-center justify-center gap-2 bg-transparent border border-[#735F32] py-2 rounded-lg hover:bg-[#f4f4f4] text-[#282A3A] transition ${loading || authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading || authLoading}
            >
              <FaFacebook size={20} className="text-[#1877F2]" />
              <span className="text-sm">Sign in with Facebook</span>
            </button>
          </div>

          <p className="text-center text-sm text-[#735F32] mt-6">
            Don’t have an account?{' '}
            <a href="/sign-up" className="text-[#C69749] hover:underline">
              Sign up
            </a>
          </p>

          <p className="text-center text-xs text-[#735F32] mt-6">© 2025 ALL RIGHTS RESERVED TO ITP</p>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block w-1/2">
          <img
            src="/signin11.jpg"
            alt="Sign In"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;