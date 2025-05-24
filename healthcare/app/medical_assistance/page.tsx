'use client';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, runTransaction } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { auth, db } from '../firebase/config';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { assets } from '../../assets/assets';
import Image from 'next/image';

type ChatMessage = {
  sender: 'user' | 'ai';
  message: string;
  timestamp?: number;
  serialNo?: number;
};

export default function MedicalChatbot() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [animationText, setAnimationText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getNextSerialNumber = async (): Promise<number> => {
    const counterRef = doc(db, 'counters', 'Medical Assistance Bot');
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

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setChatHistory(parsed);
        }
      } catch (err) {
        console.error('Failed to parse chat history from localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping, animationText]);

  const handleChat = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = { 
      sender: 'user', 
      message: userInput,
      timestamp: Date.now()
    };
    
    const user = auth.currentUser;
    setChatHistory((prev) => [...prev, newUserMessage]);
    setLoading(true);
    setIsTyping(false);
    setUserInput('');
    setAnimationText('Finding...');

    // Animation sequence
    const animationSteps = ['Finding...', 'Generating...', 'Fetching...'];
    let stepIndex = 0;
    const totalDuration = 5000; // 5 seconds
    const stepDuration = totalDuration / animationSteps.length; // ~1.67 seconds per step
    const animationInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % animationSteps.length;
      setAnimationText(animationSteps[stepIndex]);
    }, stepDuration);

    // Delay fetch by 5 seconds
    setTimeout(async () => {
      clearInterval(animationInterval);
      setAnimationText('');
      setIsTyping(true);
      setTypingText('');

      try {
        const res = await fetch('http://127.0.0.1:5000/medical_assistance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userInput }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server responded with status ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        const reply = data.reply.Answer || '⚠️ Could not parse response from server answer.';
        const Questioncategrory = data.reply.Category || '⚠️ Could not parse response from qtype.';
        
        // Start typing simulation immediately
        simulateTyping(reply);

        if (user) {
          const serialNo = await getNextSerialNumber();
          
          await addDoc(collection(db, 'Medical Assistance Bot'), {
            serialNo: serialNo,
            userName: userName,
            date: serverTimestamp(),
            userMessage: userInput,
            botResponse: reply,
            categroryQuestion: Questioncategrory
          });

          setChatHistory(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 ? { ...msg, serialNo } : msg
          ));
        }
      } catch (error: any) {
        const errMsg = `⚠️ Error: ${error.message || 'Could not connect to the server.'}`;
        setChatHistory((prev) => [...prev, { 
          sender: 'ai', 
          message: errMsg,
          timestamp: Date.now()
        }]);
        setIsTyping(false);
      } finally {
        setLoading(false);
        setAnimationText('');
      }
    }, totalDuration);
  };

  const simulateTyping = (text: string) => {
    let i = 0;
    const speed = 20;
    setTypingText('');
    
    const interval = setInterval(() => {
      if (i < text.length) {
        setTypingText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setChatHistory((prev) => [...prev, { 
          sender: 'ai', 
          message: text,
          timestamp: Date.now()
        }]);
      }
    }, speed);

    return () => clearInterval(interval);
  };

  const formatResponse = (text: string): React.ReactNode[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const elements: React.ReactNode[] = [];

    let currentList: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const pushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent key={`list-${elements.length}`} className={`ml-6 mb-3 ${listType === 'ul' ? 'list-disc' : 'list-decimal'}`}>
            {currentList}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (/^#{1,3}\s/.test(trimmed)) {
        pushList();
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        const headingClass = level === 1 ? 'text-2xl font-bold my-4' : level === 2 ? 'text-xl font-bold my-3' : 'text-lg font-semibold my-2';
        elements.push(
          <h3 key={`heading-${index}`} className={`${headingClass} ${level > 1 ? 'text-white' : 'text-blue-200'}`}>
            {trimmed.replace(/^#+\s/, '')}
          </h3>
        );
      } else if (/^[-*•]\s/.test(trimmed)) {
        if (listType !== 'ul') pushList();
        listType = 'ul';
        currentList.push(
          <li key={`li-${index}`} className="mb-1">
            {trimmed.substring(2)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (listType !== 'ol') pushList();
        listType = 'ol';
        currentList.push(
          <li key={`li-${index}`} className="mb-1">
            {trimmed.substring(trimmed.indexOf('.') + 1).trim()}
          </li>
        );
      } else if (/^>\s/.test(trimmed)) {
        pushList();
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-blue-400 pl-4 italic text-gray-300 my-3">
            {trimmed.substring(2)}
          </blockquote>
        );
      } else if (/^```/.test(trimmed)) {
        pushList();
        elements.push(
          <pre key={`code-${index}`} className="bg-gray-700 p-3 rounded-md font-mono text-sm overflow-x-auto my-3">
            {trimmed.replace(/^```/, '')}
          </pre>
        );
      } else {
        pushList();
        elements.push(
          <p key={`para-${index}`} className="mb-3 leading-relaxed">
            {trimmed}
          </p>
        );
      }
    });

    pushList();
    return elements;
  };

  const clearChatHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-4 border-r border-gray-700 transition-transform duration-300 z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-6 flex items-center justify-between">
          <a href="#top" className="flex items-center">
            <Image 
              src={assets.logo} 
              className="w-30 cursor-pointer" 
              alt="Logo" 
              width={120}
              height={40}
            />
          </a>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav>
          <ul>
            <li className="mb-3">
              <button 
                onClick={() => {
                  clearChatHistory();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center p-2 rounded hover:bg-gray-700 text-gray-200"
              >
                + <span className="ml-2">New chat</span>
              </button>
            </li>
            <li className="mb-3 text-gray-400 font-semibold text-sm uppercase tracking-wider">Recent Chats</li>
            <li className="mb-3">
              <Link 
                href="/#contact" 
                className="flex items-center p-2 rounded hover:bg-gray-700 text-gray-300"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span>Need Help?</span>
              </Link>
            </li>
            <li className="mb-3">
              <Link 
                href="/activity" 
                className="flex items-center p-2 rounded hover:bg-gray-700 text-gray-300"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span>Preferences</span>
              </Link>
            </li>
            <li className="mb-3">
              <Link 
                href="/#" 
                className="flex items-center p-2 rounded hover:bg-gray-700 text-gray-300"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4 right-4 text-xs font-semibold text-gray-500">
          <p>This chatbot may produce incorrect information. Please verify results.</p>
          {userName && <p className="mt-2">Logged in as: {userName}</p>}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <Link href="http://localhost:3000" className="text-[#ffffff] border px-2 py-0.5 rounded-md hover:bg-[#735Ff2] transition">
            🡸
          </Link>
          <h1 className="text-xl font-bold">Medical Knowledge Assistant</h1>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-32">
          {chatHistory.length === 0 && !isTyping && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h2 className="text-3xl font-bold text-blue-200 mb-4">Hello, {userName.toUpperCase() || 'User'}</h2>
              <p className="text-xl text-gray-300 mb-8">How can I assist you with medical information today?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                <button 
                  onClick={() => setUserInput('What are the symptoms of diabetes?')}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 text-left"
                >
                  <h3 className="font-semibold text-blue-200">Diabetes Symptoms</h3>
                  <p className="text-sm text-gray-400">Learn about common signs</p>
                </button>
                <button 
                  onClick={() => setUserInput('How to treat a migraine?')}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 text-left"
                >
                  <h3 className="font-semibold text-blue-200">Migraine Treatment</h3>
                  <p className="text-sm text-gray-400">Relief options</p>
                </button>
                <button 
                  onClick={() => setUserInput('First aid for burns')}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 text-left"
                >
                  <h3 className="font-semibold text-blue-200">Burn First Aid</h3>
                  <p className="text-sm text-gray-400">Immediate steps</p>
                </button>
                <button 
                  onClick={() => setUserInput('Explain blood pressure readings')}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 border border-gray-700 text-left"
                >
                  <h3 className="font-semibold text-blue-200">Blood Pressure</h3>
                  <p className="text-sm text-gray-400">Understanding your numbers</p>
                </button>
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-6">
            {chatHistory.map((chat, idx) => (
              <div 
                key={idx} 
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[90%] md:max-w-[80%] rounded-lg p-4 ${chat.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100'}`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-sm font-semibold">
                      {chat.sender === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    {chat.timestamp && (
                      <div className="text-xs text-gray-400 ml-2">
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {formatResponse(chat.message)}
                  </div>
                </div>
              </div>
            ))}

            {(isTyping || (loading && animationText)) && (
              <div className="flex justify-start">
                <div className="max-w-[90%] md:max-w-[80%] rounded-lg p-4 bg-gray-800">
                  <div className="text-sm font-semibold mb-1">AI Assistant</div>
                  <div className="text-sm font-medium mb-1 text-[rgb(255, 26, 26)]">Our Bot is Attention Seeker. so, Please Stick with this page:</div>
                  <div className="whitespace-pre-wrap">
                    {formatResponse(animationText || typingText)}
                    <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-blink"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gray-800 border-t border-gray-700 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChat();
            }}
            className="flex items-center space-x-4 max-w-4xl mx-auto"
          >
            <textarea
              rows={1}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-40 overflow-y-auto"
              placeholder="Ask about symptoms, treatments, etc. We only supports Textual data."
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
              required
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className={`p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center justify-center ${loading || !userInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-xs text-center text-gray-500 mt-2">
            Medical information provided is for educational purposes only. Consult a healthcare professional for medical advice.
          </div>
        </div>
      </div>
    </div>
  );
}