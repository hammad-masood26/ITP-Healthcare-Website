'use client';
import { Card, CardContent } from '../../ui/card';
import BarChartComponent from '../charts/BarChartComponent';
import { StatItem, DashboardData, MedicalBotAllData } from '../types';
import LineChartComponent from '../charts/LineChartComponent';
import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

interface Trend {
  count: number;
  date: string;
}

interface Category {
  name: string;
  count: number;
}

interface User {
  id: string;
  name: string;
  gender: string;
}

function isDateToday(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  return date >= today && date <= tomorrow;
}

export default function MedicalAssistanceTab({
  stats,
  data,
}: {
  stats: StatItem;
  data: DashboardData;
}) {
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState('');
  const [timeframe, setTimeframe] = useState<'Today' | 'Overall'>('Overall');
  const [gender, setGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>(data.mentalHealthTrends);
  const [medicalData] = useState<MedicalBotAllData[]>(data.medicalBotalldata || []);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(data.medicalBotCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || '');
          setUserGender(userDoc.data().gender || '');
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (timeframe === 'Today') {
      const todayData = data.mentalHealthTrends.filter((trend) =>
        isDateToday(trend.date)
      );
      setFilteredTrends(todayData);
    } else {
      setFilteredTrends(data.mentalHealthTrends);
    }
  }, [timeframe, data.mentalHealthTrends]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      setIsLoading(true);
      try {
        const startDate = timeframe === 'Today'
          ? new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'
          : new Date(new Date().setDate(new Date().getDate() - 90)).toISOString();
        const endDate = timeframe === 'Today'
          ? new Date().toISOString().split('T')[0] + 'T23:59:59.999Z'
          : new Date().toISOString();

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.post(`${apiUrl}/admin/stats`, {
          gender,
          start_date: startDate,
          end_date: endDate,
          operation: 'POST',
        });

        const analytics = response.data.analytics;
        console.log('API response for filteredCategories:', analytics.categories); // Debug API response
        if (analytics.categories && analytics.categories.length > 0) {
          setFilteredCategories(analytics.categories);
        } else {
          console.warn('No valid categories in API response, retaining existing data');
          setFilteredCategories(data.medicalBotCategories); // Fallback to initial data
        }
      } catch (error) {
        console.error('Error fetching filtered data:', error);
        setFilteredCategories(data.medicalBotCategories); // Fallback to initial data
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredData();
  }, [gender, timeframe, data.medicalBotCategories]);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const truncateText = (text: string, limit: number) => {
    const words = text.split(' ');
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '...';
  };

  // Debug filteredCategories state
  useEffect(() => {
    console.log('filteredCategories updated:', filteredCategories);
  }, [filteredCategories]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4 font-bold text-[25px] text-center">All Mental Health Data</h3>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm text-[#C69749] border border-[#735F32] rounded-lg">
              <thead className="bg-[#282A3A] sticky top-0">
                <tr>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Date</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">User</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Message</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Response</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Question Category</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-2 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C69749]"></div>
                      </div>
                    </td>
                  </tr>
                ) : medicalData.length > 0 ? (
                  medicalData.map((entry, index) => (
                    <tr key={index} className="bg-[#1e1e2d] hover:bg-[#282A3A]">
                      <td className="p-2 border-b border-[#735F32]">{entry.date || 'N/A'}</td>
                      <td className="p-2 border-b border-[#735F32]">{entry.userName || 'Anonymous'}</td>
                      <td className="p-2 border-b border-[#735F32]">{entry.userMessage || 'N/A'}</td>
                      <td className="p-2 border-b border-[#735F32] justify-between">
                        <span>
                          {expandedRows.includes(index)
                            ? entry.botResponse || 'N/A'
                            : truncateText(entry.botResponse || 'N/A', 10)}
                        </span>
                        {(entry.botResponse || '').split(' ').length > 10 && (
                          <button
                            onClick={() => toggleRow(index)}
                            className="text-[#C69749] focus:outline-none"
                          >
                            {expandedRows.includes(index) ? '▲' : '▼'}
                          </button>
                        )}
                      </td>
                      <td className="p-2 border-b border-[#735F32] capitalize">{entry.categoryQuestion || 'Unknown'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-2 text-center">No mental health data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#C69749]">Medical Assistance Bot</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-[#C69749] mb-2">Filter Trends By</h4>
                <div className="flex space-x-4">
                  {(['Overall', 'Today'] as const).map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeframe"
                        value={option}
                        checked={timeframe === option}
                        onChange={() => setTimeframe(option)}
                        className="hidden"
                        aria-label={`Select ${option} timeframe`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          timeframe === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {timeframe === option && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>
                        )}
                      </span>
                      <span className="text-sm text-[#C69749]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300">
                <h4 className="text-md font-medium mb-2 text-[#C69749]">
                  {timeframe} Predictions: {filteredTrends.reduce((sum, t) => sum + t.count, 0)}
                </h4>
                <LineChartComponent data={filteredTrends} dataKey="count" />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-[#C69749] mb-2">Filter by Gender</h4>
                <div className="flex space-x-4">
                  {(['All', 'Male', 'Female'] as const).map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={gender === option}
                        onChange={() => setGender(option)}
                        className="hidden"
                        aria-label={`Select ${option} gender filter`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          gender === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {gender === option && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>
                        )}
                      </span>
                      <span className="text-sm text-[#C69749]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300">
                <h4 className="text-md font-medium mb-2 text-[#C69749]">Top Conditions</h4>
                <div className="max-h-75 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center text-[#C69749]">Loading chart data...</div>
                  ) : filteredCategories.length > 0 ? (
                    <BarChartComponent
                      data={filteredCategories}
                      dataKey="count"
                      yAxisKey="count"
                      xAxisKey="name"
                      barColors={[
                        "#f05940",
                        "#1984c5",
                        "#22a7f0",
                        "#48b5c4",
                        "#76c68f",
                        "#a6d75b",
                        "#c9e52f",
                        "#d0ee11",
                        "#f4d35e",
                        "#ee964b",
                        "#f05940",
                        "#d33f49",
                        "#b43757",
                        "#9b2779",
                        "#672f89",
                        "#4b2367",
                        "#2e294e",
                        "#3b5998",
                        "#4a7043",
                        "#8b5a2b",
                      ]}
                      title="Most Common Words"
                    />
                  ) : (
                    <div className="text-center text-[#C69749]">No data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}