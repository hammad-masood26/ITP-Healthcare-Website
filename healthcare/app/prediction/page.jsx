'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../../app/firebase/config';
import { doc, getDoc, collection, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import Link from 'next/link';

export default function ConditionPredictor() {
  const [description, setDescription] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  // Function to get the next serial number
  const getNextSerialNumber = async () => {
    const counterRef = doc(db, 'counters', 'Disease Predictor');
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
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        }
      }
    };

    fetchUserName();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    const user = auth.currentUser;

    try {
      const res = await fetch('http://127.0.0.1:5000/disease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: description }),
      });

      const data = await res.json();
      console.log("Prediction response from backend:", data.prediction);

      if (typeof data.prediction === 'string') {
        alert(data.prediction);
      } else if (data.prediction) {
        setPrediction(data.prediction);

        if (user) {
          const serialNo = await getNextSerialNumber();
          
          await addDoc(collection(db, 'Disease Predictor'), {
            serialNo: serialNo,  // Add the serial number here
            userName: userName,
            date: serverTimestamp(),
            inputDescription: description,
            disease: data.prediction.disease || 'Unknown',
            cures: data.prediction.cures || 'Not specified',
            doctor: data.prediction.doctor || 'General Physician',
            riskLevel: data.prediction["risk level"] || 'Medium'
          });
        }
      } else if (data.error) {
        alert("Server Error: " + data.error);
      } else {
        alert("Unexpected server response.");
      }
    } catch (err) {
      console.error("Request error:", err);
      alert('Failed to connect to prediction server.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#282A3A] to-[#C69749] flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-xl w-full border border-[#282A3A]">
        <div className="flex justify-between items-center font-extrabold mb-4">
          <Link href="http://localhost:3000" className="text-[#000000] border border-[#735F32] px-2 py-0.5 rounded-md hover:bg-[#735F32] transition">
            🡸
          </Link>

          {userName && (
            <p className="text-lg font-medium text-center text-[#000000] mb-3">
              <span>👤</span>
              Hello, <span className="text-[#000000] font-bold">{userName.toUpperCase()}</span>
            </p>
          )}
        </div>

        <h1 className="text-3xl font-bold text-center mb-6 text-[#C69749]">
          🧠 Patient Health Condition Predictor
        </h1>
        <h3 className="text-1xl font-bold text-center mb-6 text-[#000000] leading-relaxed">
          "An ounce of prevention is worth a pound of cure." <br />
          "Health is not valued till sickness comes."
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block font-semibold text-[#282A3A] mb-2">
              Describe the patient's symptoms:
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="e.g. Fever, headache, and sore throat for the past 3 days"
              className="w-full border border-[#735F32] rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#C69749]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <p className="text-gray-500 text-center text-xs mb-1">
                        This model may produce incorrect information. Please verify results.
                        </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#282A3A] hover:bg-[#735F32] text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2  disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Predicting...
              </>
            ) : (
              <>
                Predict Condition
                
              </>
            )}
          </button>
        </form>

        {prediction && (
          <div className="mt-8 space-y-4">
            <div className="bg-gray-50 p-0 rounded-lg">
              <h2 className="text-lg font-semibold text-[#282A3A] text-center">🩺 Predicted Disease:</h2>
              <p className="text-xl text-red-700 font-bold mt-1 text-center">{prediction.disease?.toUpperCase() || 'Unknown'}</p>
            </div>
            
            <div className="bg-gray-50 p-0 rounded-lg">
              <h2 className="text-lg font-semibold text-[#282A3A] text-center">💊 Recommended Cure:</h2>
              <p className="text-md text-blue-700 font-semibold mt-1 text-center">{prediction.cures || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 p-0 rounded-lg">
              <h2 className="text-lg font-semibold text-[#282A3A] text-center">👨‍⚕ Suggested Doctor:</h2>
              <p className="text-md text-blue-700 font-semibold mt-1 text-center">{prediction.doctor || 'General Physician'}</p>
            </div>
            
            <div className="bg-gray-50 p-0 rounded-lg">
              <h2 className="text-lg font-semibold text-[#282A3A] text-center">⚠ Risk Level:</h2>
              <p className="text-md text-blue-700 font-semibold mt-1 text-center">{prediction["risk level"] || 'Medium'}</p>
            </div>
            <div className="text-xs text-center text-gray-500 mt-2">
            Medical information provided is for educational purposes only. Consult a healthcare professional for medical advice.
          </div>
          </div>
        )}
      </div>
    </div>
  );
}