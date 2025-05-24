'use client';
import { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import OverallTab from './tabs/OverallTab';
import MedicalAssistanceTab from './tabs/MedicalAssistanceTab';
import DiseasePredictorTab from './tabs/DiseasePredictorTab';
import MentalHealthTab from './tabs/MentalHealthTab';
import FeedbackTab from './tabs/FeedbackTab';
import { ChevronDown, RotateCw } from 'lucide-react';
import { StatItem, DashboardData } from './types';
import Link from 'next/link';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [stats, setStats] = useState<StatItem>({
    users: 0,
    disease_predictions: 0,
    medical_condition_predictions: 0,
    mental_health_assessments: 0,
    chatbot_interactions: 0,
    feedbacks: 0,
  });

  const initialDashboardData: DashboardData = {
    diseaseTrends: [],
    mentalHealthTrends: [],
    chatbotTrends: [],
    userGrowth: [],
    userActivity: [],
    diseaseCategories: [],
    medicalBotCategories: [],
    medicalBotTrends: [],
    diseaseDoctors: [],
    diseaseMedicine: [],
    diseasealldata: [],
    feedbackalldata: [],
    medicalBotalldata: [],
    mentalHealthDistribution: [],
    mentalalldata: [],
    mentalScores: [],
    diseaseRiskLevels: [],
    feedbackSentiment: [],
    recentLogs: [],
    feedbackComments: [],
    userInsights: { active_today: 0, active_week: 0, new_users_week: 0, retention_rate: 0 },
  };

  const [data, setData] = useState<DashboardData>(initialDashboardData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // New state for auth loading
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // New state for admin role
  const router = useRouter();

  const tabLabels = {
    overall: 'Overall Analytics',
    medical_assistance: 'Medical Assistance',
    disease_predictor: 'Disease Predictor',
    mental_health: 'Mental Health',
    feedback: 'User Feedback',
  };

  // Check authentication and role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin');
          } else {
            setIsAdmin(false); // No user document, not an admin
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false); // Not authenticated
        router.push('/login'); // Redirect to login page
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/admin/stats', {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      const result = await response.json();

      setStats({
        users: result.basic_stats?.total_users || 0,
        disease_predictions: result.basic_stats?.disease_predictions || 0,
        medical_condition_predictions: result.basic_stats?.medical_condition_predictions || 0,
        mental_health_assessments: result.basic_stats?.mental_health_assessments || 0,
        chatbot_interactions: result.basic_stats?.chatbot_interactions || 0,
        feedbacks: result.basic_stats?.feedbacks || 0,
      });

      setData({
        diseaseTrends: result.analytics?.diseaseTrends || [],
        mentalHealthTrends: result.analytics?.mentalHealthTrends || [],
        chatbotTrends: result.analytics?.chatbotTrends || [],
        userGrowth: result.analytics?.userGrowth || [],
        userActivity: result.analytics?.userActivity || [],
        diseaseCategories: result.analytics?.diseaseCategories || [],
        medicalBotCategories: result.analytics?.medicalBotCategories || [],
        medicalBotTrends: result.analytics?.medicalBotTrends || [],
        diseaseDoctors: result.analytics?.diseaseDoctors || [],
        diseaseMedicine: result.analytics?.diseaseMedicine || [],
        diseasealldata: result.analytics?.diseasealldata || [],
        medicalBotalldata: result.analytics?.medicalBotalldata || [],
        feedbackalldata: result.analytics?.feedbackalldata || [],
        mentalHealthDistribution: result.analytics?.mentalHealthDistribution || [],
        mentalalldata: result.analytics?.mentalalldata || [],
        mentalScores: result.analytics?.mentalHealthDistribution || [],
        diseaseRiskLevels: result.analytics?.diseaseRiskLevels || [],
        feedbackSentiment: result.analytics?.feedbackSentiment || [],
        recentLogs: result.recent_activity?.recentLogs || [],
        feedbackComments: result.recent_activity?.feedback || [],
        userInsights: {
          active_today: result.basic_stats?.active_today || 0,
          active_week: result.basic_stats?.active_week || 0,
          new_users_week: result.basic_stats?.new_users_week || 0,
          retention_rate: result.basic_stats?.retention_rate || 0,
        },
      });

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      console.error('Dashboard error:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 21600000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchData();
  };

  const handleReplySubmit = async (feedbackId: string, message: string) => {
    if (!message.trim()) return false;
    try {
      const response = await fetch('http://localhost:5000/admin/feedback/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, message }),
      });
      if (response.ok) {
        const updatedFeedback = await response.json();
        setData((prev) => ({
          ...prev,
          feedbackComments: prev.feedbackComments.map((f) =>
            f.email === feedbackId ? { ...f, ...updatedFeedback } : f
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending reply:', error);
      return false;
    }
  };

  const renderTabContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-[#282A3A] border border-red-400 px-4 py-2 rounded-lg hover:bg-[#1e1e2d] transition-colors"
          >
            <RotateCw size={16} />
            Retry
          </button>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C69749]"></div>
        </div>
      );
    }
    switch (activeTab) {
      case 'medical_assistance':
        return <MedicalAssistanceTab stats={stats} data={data} />;
      case 'disease_predictor':
        return <DiseasePredictorTab stats={stats} data={data} />;
      case 'mental_health':
        return <MentalHealthTab stats={stats} data={data} />;
      case 'feedback':
        return <FeedbackTab stats={stats} data={data} onReplySubmit={handleReplySubmit} />;
      default:
        return <OverallTab stats={stats} data={data} />;
    }
  };

  // Render loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121218]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C69749]"></div>
      </div>
    );
  }

  // Render access denied if not admin
  if (isAdmin === false) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#121218] text-white">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
        <p className="text-gray-400 mb-6">You do not have permission to access the admin panel.</p>
        <Link
          href="/login"
          className="bg-[#C69749] text-[#1e1e2d] px-4 py-2 rounded-lg hover:bg-[#B1873A] transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Render dashboard if admin
  return (
    <div className="p-6 bg-[#121218] min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="http://localhost:3000/" className="text-[#ffffff] border border-[#735F32] px-2 py-0.5 rounded-md hover:bg-[#735F32] transition">
            🡸
          </Link>
          <h1 className="text-3xl font-bold text-[#C69749]">Admin Dashboard</h1>
          {lastUpdated && <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdated}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#282A3A] border border-[#735F32] px-3 py-1 rounded-lg hover:bg-[#1e1e2d] transition-colors disabled:opacity-50"
          >
            <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-[#282A3A] border border-[#735F32] px-4 py-2 rounded-lg hover:bg-[#1e1e2d] transition-colors"
            >
              {tabLabels[activeTab as keyof typeof tabLabels]}
              <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#282A3A] border border-[#735F32] rounded-lg shadow-lg z-10">
                {Object.entries(tabLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#1e1e2d] ${activeTab === key ? 'text-[#C69749]' : 'text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <DashboardStats stats={stats} loading={isLoading} />
      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;