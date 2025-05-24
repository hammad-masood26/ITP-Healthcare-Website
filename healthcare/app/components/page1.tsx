'use client';
import { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  Users, Activity, Brain, MessageCircle, 
  Stethoscope, HeartPulse, MessageSquareText,
  ChevronDown, Calendar, AlertTriangle, 
  Star, Mail, ClipboardList, Send, Reply, Loader2
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [stats, setStats] = useState({
    users: 0,
    disease_predictions: 0,
    medical_condition_predictions: 0,
    mental_health_assessments: 0,
    chatbot_interactions: 0,
    feedbacks: 0
  });
  const [diseaseTrends, setDiseaseTrends] = useState([]);
  const [mentalHealthTrends, setMentalHealthTrends] = useState([]);
  const [chatbotTrends, setChatbotTrends] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [diseaseCategories, setDiseaseCategories] = useState([]);
  const [mentalScores, setMentalScores] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [feedbackComments, setFeedbackComments] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  type IconKey = keyof typeof stats; // 'users' | 'disease_predictions' | etc...

  const iconMap: Record<string, ReactNode> = {
  users: <Users className="text-[#C69749]" size={20} />,
  disease_predictions: <Activity className="text-[#C69749]" size={20} />,
  medical_condition_predictions: <Stethoscope className="text-[#C69749]" size={20} />,
  mental_health_assessments: <Brain className="text-[#C69749]" size={20} />,
  chatbot_interactions: <MessageCircle className="text-[#C69749]" size={20} />,
  feedbacks: <MessageSquareText className="text-[#C69749]" size={20} />
};

  const tabLabels: Record<string, string> = {
    overall: 'Overall Analytics',
    medical_assistance: 'Medical Assistance',
    disease_predictor: 'Disease Predictor',
    mental_health: 'Mental Health',
    feedback: 'User Feedback'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/stats');
      const data = await response.json();
      
      setStats({
        users: data.total_users || 0,
        disease_predictions: data.disease_predictions || 0,
        medical_condition_predictions: data.medical_condition_predictions || 0,
        mental_health_assessments: data.mental_health_assessments || 0,
        chatbot_interactions: data.chatbot_interactions || 0,
        feedbacks: data.feedbacks || 0
      });
      setDiseaseTrends(data.diseaseTrends || []);
      setMentalHealthTrends(data.mentalHealthTrends || []);
      setChatbotTrends(data.chatbotTrends || []);
      setUserGrowth(data.userGrowth || []);
      setDiseaseCategories(data.diseaseCategories || []);
      setMentalScores(data.mentalScores || []);
      setRecentLogs(data.recentLogs || []);
      setFeedbackComments(data.feedbackComments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleReplySubmit = async (feedbackId: string) => {
    if (!replyMessage.trim()) return;
    
    setIsSendingReply(true);
    try {
      const response = await fetch('http://localhost:5000/admin/feedback/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId,
          message: replyMessage
        }),
      });

      if (response.ok) {
        await fetchData(); // Refresh all data
        setReplyingTo(null);
        setReplyMessage('');
      } else {
        console.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'medical_assistance':
        return renderMedicalAssistanceTab();
      case 'disease_predictor':
        return renderDiseasePredictorTab();
      case 'mental_health':
        return renderMentalHealthTab();
      case 'feedback':
        return renderFeedbackTab();
      default:
        return renderOverallTab();
    }
  };

  const renderOverallTab = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userGrowth}>
                <XAxis dataKey="date" stroke="#C69749" />
                <YAxis stroke="#C69749" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#C69749" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Top Disease Predictions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diseaseCategories}>
                <XAxis dataKey="name" stroke="#C69749" />
                <YAxis stroke="#C69749" />
                <Tooltip />
                <Bar dataKey="count" fill="#C69749" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Mental Health Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mentalScores}
                  dataKey="value"
                  nameKey="label"
                  outerRadius={80}
                  label
                >
                  {mentalScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#C69749', '#735F32', '#FFD700'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Recent System Activity</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {recentLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-[#282A3A] rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{log.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{log.feature}</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Recent Feedback</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {feedbackComments.slice(0, 5).map((feedback, i) => (
                <div key={i} className="p-2 bg-[#282A3A] rounded-lg">
                  <p className="text-sm font-medium">{feedback.name}</p>
                  <p className="text-xs text-gray-400 truncate">{feedback.message}</p>
                  <p className="text-xs text-[#C69749] mt-1">
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderMedicalAssistanceTab = () => (
    <div className="space-y-6">
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4">Medical Condition Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Total Predictions: {stats.medical_condition_predictions}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={diseaseTrends}>
                  <XAxis dataKey="date" stroke="#C69749" />
                  <YAxis stroke="#C69749" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C69749" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Top Conditions</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {diseaseCategories.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-[#282A3A] rounded-lg">
                    <span className="text-sm capitalize">{item.name}</span>
                    <span className="text-sm text-[#C69749]">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDiseasePredictorTab = () => (
    <div className="space-y-6">
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4">Disease Prediction Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Total Predictions: {stats.disease_predictions}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={diseaseTrends}>
                  <XAxis dataKey="date" stroke="#C69749" />
                  <YAxis stroke="#C69749" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#C69749" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Risk Level Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'High Risk', value: 15 },
                      { name: 'Medium Risk', value: 35 },
                      { name: 'Low Risk', value: 50 }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#FF6B6B" />
                    <Cell fill="#FFD166" />
                    <Cell fill="#06D6A0" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMentalHealthTab = () => (
    <div className="space-y-6">
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4">Mental Health Assessments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Total Assessments: {stats.mental_health_assessments}</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mentalHealthTrends}>
                  <XAxis dataKey="date" stroke="#C69749" />
                  <YAxis stroke="#C69749" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#C69749" 
                    strokeWidth={2} 
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Assessment Results</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mentalScores}
                    dataKey="value"
                    nameKey="label"
                    outerRadius={80}
                    label
                  >
                    {mentalScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#FF6B6B', '#FFD166', '#06D6A0'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeedbackTab = () => (
    <div className="space-y-6">
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4">User Feedback & Comments</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Total Feedback: {stats.feedbacks}</h4>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {feedbackComments.map((feedback) => (
                  <div key={feedback._id} className="p-4 bg-[#282A3A] rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{feedback.name}</p>
                        <p className="text-sm text-gray-400">{feedback.email}</p>
                      </div>
                      <p className="text-xs text-[#C69749]">
                        {new Date(feedback.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 text-sm">{feedback.message}</p>
                    
                    {feedback.reply && (
                      <div className="mt-3 p-3 bg-[#1e1e2d] rounded-lg border-l-4 border-[#C69749]">
                        <div className="flex items-center gap-2 text-sm text-[#C69749] mb-1">
                          <Reply size={14} />
                          <span>Admin Response</span>
                        </div>
                        <p className="text-sm">{feedback.reply}</p>
                        {feedback.replyTimestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                            Replied on: {new Date(feedback.replyTimestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {!feedback.reply && (
                      <div className="mt-3">
                        {replyingTo === feedback._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              className="w-full p-2 bg-[#282A3A] border border-[#735F32] rounded text-sm"
                              placeholder="Type your response here..."
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyMessage('');
                                }}
                                className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplySubmit(feedback._id)}
                                disabled={isSendingReply}
                                className="px-3 py-1 text-sm bg-[#C69749] rounded hover:bg-[#B1873A] flex items-center gap-1"
                              >
                                {isSendingReply ? (
                                  <>
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send size={14} />
                                    Send Reply
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(feedback._id)}
                            className="flex items-center gap-1 text-sm text-[#C69749] hover:text-[#B1873A]"
                          >
                            <Reply size={14} />
                            Reply to Feedback
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 bg-[#121218] min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#C69749]">Admin Dashboard</h1>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-[#282A3A] border border-[#735F32] px-4 py-2 rounded-lg hover:bg-[#1e1e2d] transition-colors"
          >
            {tabLabels[activeTab]}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="bg-[#1e1e2d] border border-[#735F32] rounded-xl hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
                <h2 className="text-2xl font-bold text-[#C69749]">{value}</h2>
              </div>
              <div className="p-2 bg-[#282A3A] rounded-full">
                {iconMap[key]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;