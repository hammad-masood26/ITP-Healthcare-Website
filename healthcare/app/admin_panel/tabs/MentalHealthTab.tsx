'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { StatItem, DashboardData, ValueData, mentalData, CategoryData } from '../types';
import LineChartComponent from '../charts/LineChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import BarChartComponent from '../charts/BarChartComponent';
import axios from 'axios';

export default function MentalHealthTab({ stats, data }: { stats: StatItem; data: DashboardData }) {
  const [mentalData, setMentalData] = useState<mentalData[]>(data.mentalalldata || []);
  const [mentalTrends, setMentalTrends] = useState(data.mentalHealthTrends || []);
  const [mentalScores, setMentalScores] = useState<ValueData>(data.mentalHealthDistribution || []);
  const [commonWords, setCommonWords] = useState<CategoryData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartFilter, setChartFilter] = useState<'Per Day' | 'Total'>('Total');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');

  // Common stop words to filter out
  const stopWords = new Set(['the', 'is', 'and', 'to', 'a', 'in', 'of', 'i', 'it', 'for', 'on', 'with', 'at', 'this', 'that', 'but', 'are', 'was', 'be', 'have', 'has', 'had']);

  // Function to extract most common words from userMessage (no gender filter on client side)
  const extractCommonWords = (data: mentalData[]): CategoryData => {
    const wordCount: { [key: string]: number } = {};

    // Check if mentalData has valid userMessage entries
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('No valid mental health data available for word analysis');
      return [];
    }

    // Process each userMessage
    data.forEach((entry) => {
      if (entry.userMessage && typeof entry.userMessage === 'string' && entry.userMessage.trim().length > 0) {
        const words = entry.userMessage
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .split(/\s+/); // Split into words

        words.forEach((word) => {
          if (word && !stopWords.has(word) && word.length > 2) { // Ignore stop words and short words
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      } else {
        console.warn('Invalid or missing userMessage in entry:', entry);
      }
    });

    // Convert to CategoryData format and sort by count
    const wordArray = Object.entries(wordCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
      .slice(0, 5); // Take top 5 words

    return wordArray.length > 0 ? wordArray : [{ name: 'No Data', count: 1 }]; // Fallback if no words found
  };

  const fetchMentalHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 30);

      const response = await axios.post('http://localhost:5000/admin/stats', {
        start_date: startDate.toISOString().replace('Z', '+00:00'),
        end_date: currentDate.toISOString().replace('Z', '+00:00'),
        gender: 'All',
      });

      const analytics = response.data.analytics || {};
      const newMentalData = analytics.mentalalldata || [];
      setMentalData(newMentalData);
      setMentalTrends(analytics.mentalHealthTrends || []);
      setMentalScores(analytics.mentalHealthDistribution || []);

      // Compute common words after fetching mentalData
      const commonWordsData = extractCommonWords(newMentalData);
      setCommonWords(commonWordsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mental health data';
      console.error('Mental health fetch error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredScores = async (gender: 'All' | 'Male' | 'Female') => {
    try {
      setIsLoading(true);
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 30);

      const response = await axios.post('http://localhost:5000/admin/stats', {
        start_date: startDate.toISOString().replace('Z', '+00:00'),
        end_date: currentDate.toISOString().replace('Z', '+00:00'),
        gender: gender,
      });

      const analytics = response.data.analytics || {};
      setMentalScores(analytics.mentalHealthDistribution || []);
      const newMentalData = analytics.mentalalldata || []; // Update mentalData with filtered data
      setMentalData(newMentalData);
      const commonWordsData = extractCommonWords(newMentalData); // Recompute common words
      setCommonWords(commonWordsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filtered scores';
      console.error('Filter fetch error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentalHealthData();
  }, []);

  useEffect(() => {
    if (chartFilter === 'Per Day') {
      const today = new Date().toISOString().split('T')[0];
      const filteredTrends = mentalTrends.filter(trend => trend.date === today);
      setMentalTrends(filteredTrends);
    } else {
      setMentalTrends(data.mentalHealthTrends || []);
    }
  }, [chartFilter, data.mentalHealthTrends]);

  useEffect(() => {
    fetchFilteredScores(genderFilter);
  }, [genderFilter]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400">
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchMentalHealthData}
          className="flex items-center gap-2 bg-[#282A3A] border border-red-400 px-4 py-2 rounded-lg hover:bg-[#1e1e2d] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* All Mental Health Data Table */}
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
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Condition</th>
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
                ) : mentalData.length > 0 ? (
                  mentalData.map((entry, index) => (
                    <tr key={index} className="bg-[#1e1e2d] hover:bg-[#282A3A]">
                      <td className="p-2 border-b border-[#735F32]">{entry.date || 'N/A'}</td>
                      <td className="p-2 border-b border-[#735F32]">{entry.userName || 'Anonymous'}</td>
                      <td className="p-2 border-b border-[#735F32]">{entry.userMessage || 'N/A'}</td>
                      <td className="p-2 border-b border-[#735F32]">{entry.botResponse || 'N/A'}</td>
                      <td className="p-2 border-b border-[#735F32] capitalize">{entry.condition || 'Unknown'}</td>
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

      {/* Mental Health Assessments Charts */}
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4 font-bold text-[25px] text-center">Mental Health Assessments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Fixed typo: md:grid-cols-y to md:grid-cols-3 */}
            <div className="relative">
              <h4 className="text-md font-medium mb-2 text-[#C69749] text-center">
                Total Assessments: {stats.mental_health_assessments}
              </h4>
              <div className="mb-3 flex justify-center space-x-4">
                {(['Total', 'Per Day'] as const).map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="chartFilter"
                      value={option}
                      checked={chartFilter === option}
                      onChange={() => setChartFilter(option)}
                      className="hidden"
                      aria-label={`Select ${option} chart filter`}
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                        chartFilter === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                      }`}
                    >
                      {chartFilter === option && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>
                      )}
                    </span>
                    <span className="text-sm text-[#C69749]">{option}</span>
                  </label>
                ))}
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading ? 'filter blur-sm' : ''}`}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                {mentalTrends.length > 0 ? (
                  <LineChartComponent
                    data={mentalTrends}
                    dataKey="count"
                    xLabel="date"
                    title="Mental Health Trends"
                  />
                ) : (
                  !isLoading && <div className="p-2 text-center text-gray-400">No trends data available</div>
                )}
              </div>
            </div>
            <div className="relative">
              <h4 className="text-md font-medium mb-2 text-[#C69749] text-center">Assessment Results</h4>
              <div className="mb-3 flex justify-center space-x-4">
                {(['All', 'Male', 'Female'] as const).map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genderFilter"
                      value={option}
                      checked={genderFilter === option}
                      onChange={() => setGenderFilter(option)}
                      className="hidden"
                      aria-label={`Select ${option} gender filter`}
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                        genderFilter === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                      }`}
                    >
                      {genderFilter === option && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>
                      )}
                    </span>
                    <span className="text-sm text-[#C69749]">{option}</span>
                  </label>
                ))}
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading ? 'filter blur-sm' : ''}`}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                {mentalScores.length > 0 ? (
                  <PieChartComponent
                    data={mentalScores}
                    dataKey="value"
                    nameKey="label"
                    colors={['#FF6B6B', '#FFD166', '#06D6A0', '#4A90E2', '#F5A623']}
                    title="Assessment Results"
                  />
                ) : (
                  !isLoading && <div className="p-2 text-center text-gray-400">No assessment results available</div>
                )}
              </div>
            </div>
            {/* Bar Chart for Most Common Words */}
            <div className="relative">
              <h4 className="text-md font-medium mb-2 text-[#C69749] text-center">Most Common Words</h4>
              <div className="mb-3 flex justify-center space-x-4">
                {(['All', 'Male', 'Female'] as const).map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="genderFilter"
                      value={option}
                      checked={genderFilter === option}
                      onChange={() => setGenderFilter(option)}
                      className="hidden"
                      aria-label={`Select ${option} gender filter for bar chart`}
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                        genderFilter === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                      }`}
                    >
                      {genderFilter === option && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>
                      )}
                    </span>
                    <span className="text-sm text-[#C69749]">{option}</span>
                  </label>
                ))}
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading ? 'filter blur-sm' : ''}`}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                {commonWords.length > 0 ? (
                  <BarChartComponent
                    data={commonWords}
                    dataKey="count"
                    nameKey="name"
                    xAxisKey="name" // Explicitly specify xAxisKey for clarity
                    barColors={[
                  '#6C5CE7', // Soft purple
                  '#00B894', // Calming teal green
                  '#FAB1A0', // Gentle peach
                  '#74B9FF', // Light sky blue
                  '#FFEAA7', // Warm soft yellow
                  '#55EFC4', // Mint green
                  '#A29BFE', // Lavender blue
                  '#FF7675', // Light coral red
                  '#81ECEC', // Aqua
                  '#FD79A8'  // Rosy pink
                ]}


                    title="Most Common Words"
                  />
                ) : (
                  !isLoading && <div className="p-2 text-center text-gray-400">No common words data available (server may not provide sufficient userMessage data)</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}