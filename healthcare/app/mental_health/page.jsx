
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, collection, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Chatbot() {
    const [message, setMessage] = useState('');
    const [prediction, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');

    // Function to get the next serial number
    const getNextSerialNumber = async () => {
        const counterRef = doc(db, 'counters', 'Mental Health Analyzer');
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
            throw error;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name);
                }
            }
        };
        fetchUser();
    }, []);

    const handleChat = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse('');
        
        const user = auth.currentUser;

        try {
            const res = await fetch('http://127.0.0.1:5000/mental_health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });
            
            const data = await res.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            const responseText = data.reply || JSON.stringify(data);
            setResponse(responseText);

            // Save to Firestore only after successful response
            if (user) {
                const serialNo = await getNextSerialNumber();
                
                await addDoc(collection(db, 'Mental Health Analyzer'), {
                    serialNo: serialNo,  // Add the serial number here
                    userName: userName,
                    date: serverTimestamp(),
                    userMessage: message,
                    botResponse: responseText,
                    condition: responseText
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setResponse(`⚠️ Error: ${error.message || 'Could not connect to the server'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#282A3A] to-[#C69749] flex items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full border border-[#282A3A]">
                {/* Header Section with Back Button and Username */}
                <div className="flex items-center justify-between mb-4">
                    {/* Back Button */}
                    <Link href="http://localhost:3000" className="text-[#000000] border border-[#735F32] px-2 py-0.5 rounded-md hover:bg-[#735F32] transition">
                        🡸
                    </Link>
                    {/* Username */}
                    {userName && (
                        <p className="text-lg font-medium text-[#000000]">
                            <span>👤</span>
                            Hello, <span className="text-[#000000] font-bold">{userName.toUpperCase()}</span>
                        </p>
                    )}
                </div>

                {/* Title Section */}
                <h1 className="text-3xl font-bold text-center mb-6 text-[#C69749]">
                    🧠 Mental Health Analyzer
                </h1>
                <h3 className="text-1xl font-bold text-center mb-6 text-[#000000] leading-relaxed">
                    Your emotional well-being matters deeply <br />
                    Explore your feelings here to foster self-awareness
                </h3>

                {/* Chat Form */}
                <form onSubmit={handleChat} className="space-y-5">
                    <label htmlFor="description" className="block font-semibold text-[#282A3A] mb-2">
                        Describe your thoughts or feelings...
                    </label>
                    <textarea
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-4 border border-[#735F32] rounded-lg text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#C69749] placeholder:text-[#735F32] resize-none transition-all leading-normal"
                        placeholder="e.g. I'm really worried, I want to cry."
                        required
                    />
                    <p className="text-gray-500 text-center text-xs mb-1">
                        This model may produce incorrect information. Please verify results.
                        </p>
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="w-full bg-[#282A3A] text-white py-3 rounded-lg font-medium hover:bg-[#735F32] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Analyzing...
                            </>
                        ) : (
                            'Analyze'
                        )}
                    </button>
                </form>

                {/* Prediction Result */}
                {prediction && (
                    <div className="mt-8 space-y-4">
                        <div className="p-4 font-bold border border-[#282A3A] bg-white rounded-lg text-[#000000] shadow-sm text-base">
                            💬 YOUR MENTAL STATE IS: <span className="italic font-bold mt-2 text-[#ff0000]">{prediction}</span>
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-2">
            This information provided is for educational purposes only. Consult a professional psychiatrist for advice.
          </div>
                    </div>
                )}
            </div>
        </div>
    );
}