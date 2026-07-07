'use client';

import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { useRouter } from 'next/navigation';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { collection, addDoc, serverTimestamp, runTransaction, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();
  const isAdminCredentials = email.trim().toLowerCase() === 'itpadmin@gmail.com' && password === 'Abc123@!';

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
    setLoading(true); // Start loading animation

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address format.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting sign-in with email:', email);
      // Authenticate user — throws on failure, caught below
      const res = await signInWithEmailAndPassword(auth, email, password);

      if (res?.user) {
        console.log('User authenticated:', res.user.uid);
        // Fetch user role from Firestore
        const userDocRef = doc(db, 'users', res.user.uid);
        const userDoc = await getDoc(userDocRef);
        let userRole = isAdminCredentials ? 'admin' : 'user';

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userRole = isAdminCredentials ? 'admin' : userData.role || 'user';
        } else if (!isAdminCredentials) {
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
        toast.success('Signed in successfully!');
        router.push(userRole === 'admin' ? '/admin_panel' : '/');
      }
    } catch (e: any) {
      console.error("Login error:", e);
      switch (e.code) {
        case 'auth/user-not-found':
          toast.error('User not found. Try a different one or create an account.');
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          toast.error('Invalid email or password.');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many attempts. Please try again later.');
          break;
        default:
          toast.error(e.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false); // Guarantee loading stops in all cases
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Fetch or create user in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let userRole = 'user';

      if (!userDoc.exists()) {
        // Create new user record if doesn't exist
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          profilePicture: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          status: 'active',
          role: 'user',
          emailVerified: user.emailVerified,
          profileComplete: false,
          accountType: 'google',
          loginCount: 1,
          metadata: {
            signUpMethod: 'google',
            ipAddress: '',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
          }
        });
      } else {
        userRole = userDoc.data().role || 'user';
        // Update last login
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
      }

      // Log the login
      const serialNo = await getNextLoginSerial();
      await addDoc(collection(db, `${userRole}_logins`), {
        serialNo,
        email: user.email,
        userId: user.uid,
        timestamp: serverTimestamp(),
        role: userRole,
      });

      // Set session and redirect
      sessionStorage.setItem('userRole', userRole);
      toast.success('Signed in successfully!');
      router.push(userRole === 'admin' ? '/admin_panel' : '/');
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked. Please enable pop-ups and try again.');
      } else {
        toast.error(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address format.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        default:
          toast.error(error.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C69749] flex items-center justify-center p-3 sm:p-6">
      <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl w-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-10 text-[#282A3A]">
          <div className="flex items-start gap-4 mb-4">
            <Link
              href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
              className="text-[#C69749] border px-2 py-0.5 rounded-md hover:bg-[#735F32] transition"
            >
              🡸
            </Link>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#C69749] leading-tight">Welcome Back</h2>
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
              disabled={loading}
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm mb-1 text-[#282A3A]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="e.g: Abc123@!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSignIn();
                  }
                }}
                className="w-full px-4 py-3 pr-10 border border-[#735F32] bg-transparent text-[#282A3A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder-[#735F32]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-3 flex items-center text-[#735F32] hover:text-[#C69749] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right mb-6">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className={`text-sm hover:underline text-[#C69749] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full bg-[#C69749] hover:bg-[#735F32] text-black font-semibold py-3 rounded-lg transition flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              onClick={handleGoogleSignIn}
              className={`w-full flex items-center justify-center gap-2 bg-transparent border border-[#735F32] py-2 rounded-lg hover:bg-[#f4f4f4] text-[#282A3A] transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <FcGoogle size={20} />
              <span className="text-sm">Sign in with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-[#735F32] mt-6">
            Don’t have an account?{' '}
            <a href="/sign-up" className="text-[#C69749] hover:underline">
              Sign up
            </a>
          </p>

          <p className="text-center text-xs text-[#735F32] mt-6">© {new Date().getFullYear()} ALL RIGHTS RESERVED TO ITP</p>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block w-1/2">
          <Image
            src="/signin11.jpg"
            alt="Sign In"
            width={640}
            height={720}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
