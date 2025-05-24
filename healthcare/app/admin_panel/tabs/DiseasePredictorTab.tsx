'use client';
import { Card, CardContent } from '../../ui/card';
import BarChartComponent from '../charts/BarChartComponent';
import { StatItem, DashboardData, TrendData, CategoryData, RiskLevelData, DiseaseDoctor, DiseaseMedicine, StructuredData as Diseasealldata } from '../types';
import LineChartComponent from '../charts/LineChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DiseasePredictorTab({
  data,
  stats,
}: {
  stats: StatItem;
  data: DashboardData;
}) {
  const [viewMode, setViewMode] = useState<'Total' | 'Today'>('Total');
  const [genderCategories, setGenderCategories] = useState<'All' | 'Male' | 'Female'>('All');
  const [genderRiskLevels, setGenderRiskLevels] = useState<'All' | 'Male' | 'Female'>('All');
  const [genderRiskLevelsTable, setGenderRiskLevelsTable] = useState<'All' | 'Male' | 'Female'>('All');
  const [genderDoctors, setGenderDoctors] = useState<'All' | 'Male' | 'Female'>('All');
  const [genderMedicine, setGenderMedicine] = useState<'All' | 'Male' | 'Female'>('All');
  const [filteredTrends, setFilteredTrends] = useState<TrendData>(data.diseaseTrends || []);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData>(data.diseaseCategories || []);
  const [filteredRiskLevels, setFilteredRiskLevels] = useState<RiskLevelData>(data.diseaseRiskLevels || []);
  const [filteredRiskLevelsTable, setFilteredRiskLevelsTable] = useState<RiskLevelData>(data.diseaseRiskLevels || []);
  const [filteredDoctors, setFilteredDoctors] = useState<DiseaseDoctor[]>(data.diseaseDoctors || []);
  const [filteredMedicine, setFilteredMedicine] = useState<DiseaseMedicine[]>(data.diseaseMedicine || []);
  const [filteredalldata, setFilteredalldata] = useState<Diseasealldata[]>(data.diseasealldata || []);
  const [isLoading, setIsLoading] = useState({
    trends: false,
    categories: false,
    riskLevels: false,
    riskLevelsTable: false,
    doctors: false,
    medicine: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    trends: null,
    categories: null,
    riskLevels: null,
    riskLevelsTable: null,
    doctors: null,
    medicine: null,
  });
 
  const calculateTodayTrends = (trends: TrendData): TrendData => {
    if (!trends || !Array.isArray(trends)) return [];
    const today = new Date().toISOString().split('T')[0];
    return trends.filter(trend => trend.date === today);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading({ ...isLoading, riskLevelsTable: true });
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const response = await axios.post('http://localhost:5000/admin/stats', {
          start_date: thirtyDaysAgo.toISOString().replace('Z', '+00:00'),
          end_date: new Date().toISOString().replace('Z', '+00:00'),
          gender: 'All',
        });
        const analytics = response.data.analytics || {};
        setFilteredalldata(analytics.diseasealldata || []);
      } catch (error: any) {
        console.error('Error fetching all disease data:', error);
        setErrors({ ...errors, riskLevelsTable: 'Failed to fetch all disease data. Showing fallback data.' });
        setFilteredalldata(data.diseasealldata || []);
      } finally {
        setIsLoading({ ...isLoading, riskLevelsTable: false });
      }
    };
    fetchAllData();
  }, []);

  const fetchData = async (endpoint: string, setData: Function, setLoadingKey: keyof typeof isLoading, setErrorKey: keyof typeof errors, params: any) => {
    setIsLoading({ ...isLoading, [setLoadingKey]: true });
    try {
      const startDate = viewMode === 'Today'
        ? new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'
        : '2025-01-01T00:00:00+00:00';
      const endDate = viewMode === 'Today'
        ? new Date().toISOString().split('T')[0] + 'T23:59:59.999Z'
        : new Date().toISOString().replace('Z', '+00:00');
      const response = await axios.post('http://localhost:5000/admin/stats', {
        ...params,
        start_date: startDate,
        end_date: endDate,
      });
      const analytics = response.data.analytics || {};
      const newData = analytics[endpoint] || [];
      setData(endpoint === 'diseaseTrends' && viewMode === 'Today' ? calculateTodayTrends(newData) : newData);
    } catch (error: any) {
      console.error(`Error fetching ${endpoint} data:`, error);
      setErrors({ ...errors, [setErrorKey]: `Failed to fetch ${endpoint} data. Showing fallback data.` });
      setData(data[endpoint as keyof DashboardData] || []);
    } finally {
      setIsLoading({ ...isLoading, [setLoadingKey]: false });
    }
  };

  useEffect(() => {
    fetchData('diseaseTrends', setFilteredTrends, 'trends', 'trends', {});
  }, [viewMode]);

  useEffect(() => {
    fetchData('diseaseCategories', setFilteredCategories, 'categories', 'categories', {
      gender: genderCategories,
    });
  }, [genderCategories]);

  useEffect(() => {
    fetchData('diseaseRiskLevels', setFilteredRiskLevels, 'riskLevels', 'riskLevels', {
      gender: genderRiskLevels,
    });
  }, [genderRiskLevels]);

  useEffect(() => {
    fetchData('diseaseRiskLevels', setFilteredRiskLevelsTable, 'riskLevelsTable', 'riskLevelsTable', {
      gender: genderRiskLevelsTable,
    });
  }, [genderRiskLevelsTable]);

  useEffect(() => {
    fetchData('diseaseDoctors', setFilteredDoctors, 'doctors', 'doctors', {
      gender: genderDoctors,
    });
  }, [genderDoctors]);

  useEffect(() => {
    fetchData('diseaseMedicine', setFilteredMedicine, 'medicine', 'medicine', {
      gender: genderMedicine,
    });
  }, [genderMedicine]);

  return (
    <div className="relative space-y-6">
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h1 className="text-lg text-[#C69749] mb-10 font-bold text-[35px] text-center">Disease Prediction Analytics</h1>

          <h3 className="text-lg text-[#C69749] mb-4 font-bold text-[25px] text-center">All Disease Prediction Data</h3>
          <div className="max-h-80 overflow-y-auto mb-20">
            <table className="w-full text-sm text-[#C69749] border border-[#735F32] rounded-lg">
              <thead className="bg-[#282A3A] sticky top-0">
                <tr>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Date</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">User</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Disease</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Risk Level</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Doctor</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Cures</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredalldata.length > 0 ? (
                  filteredalldata.reverse().map((alldata, i) => (
                    <tr key={i} className="bg-[#1e1e2d] hover:bg-[#282A3A]">
                      <td className="p-2 border-b border-[#735F32]">{alldata.date || 'N/A'}</td>
                      <td className="p-2 border-b border-[#735F32]">{alldata.userName || 'Anonymous'}</td>
                      <td className="p-2 border-b border-[#735F32] capitalize">{alldata.disease || 'Unknown'}</td>
                      <td className="p-2 border-b border-[#735F32] capitalize">{alldata.riskLevel || 'Not Specified'}</td>
                      <td className="p-2 border-b border-[#735F32] capitalize">{alldata.doctor || 'Not Prescribed'}</td>
                      <td className="p-2 border-b border-[#735F32] capitalize">{alldata.cures || 'Not Prescribed'}</td>
                      <td className="p-2 border-b border-[#735F32]">{alldata.inputDescription || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-2 text-center">No disease data available</td>
                  </tr>
                )}
              </tbody>
            </table>
            {errors.riskLevelsTable && <div className="text-red-500 text-center mt-2">{errors.riskLevelsTable}</div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
            <div className="relative">
              <h4 className="text-md mb-4 text-[#C69749] font-bold text-[25px] text-center">
                {viewMode} User Growth: {filteredTrends.reduce((sum, t) => sum + t.count, 0)}
              </h4>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#C69749] mb-2">View Mode for User Growth</h4>
                <div className="flex space-x-4">
                  {(['Total', 'Today'] as const).map((mode) => (
                    <label key={mode} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="viewModeTrends"
                        value={mode}
                        checked={viewMode === mode}
                        onChange={() => setViewMode(mode)}
                        className="hidden"
                        aria-label={`Select ${mode} view mode for User Growth`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          viewMode === mode ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {viewMode === mode && <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>}
                      </span>
                      <span className="text-sm text-[#C69749]">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading.trends ? 'filter blur-sm' : ''}`}>
                {filteredTrends.length === 0 && !isLoading.trends && (
                  <div className="p-2 text-center text-gray-400">No trends data available</div>
                )}
                {isLoading.trends && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                {filteredTrends.length > 0 && (
                  <LineChartComponent
                    data={filteredTrends}
                    dataKey="count"
                    xLabel="date"
                    title={`${viewMode} User Growth Over Time`}
                  />
                )}
                {errors.trends && <div className="text-red-500 text-center mt-2">{errors.trends}</div>}
              </div>
            </div>

            <div className="relative">
              <h4 className="text-md mb-4 text-[#C69749] font-bold text-[25px] text-center">Risk Level Distribution</h4>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#C69749] mb-2">Filter by Gender for Risk Levels </h4>
                <div className="flex space-x-4">
                  {(['All', 'Male', 'Female'] as const).map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="genderRiskLevels"
                        value={option}
                        checked={genderRiskLevels === option}
                        onChange={() => setGenderRiskLevels(option)}
                        className="hidden"
                        aria-label={`Select ${option} gender filter for Risk Levels (PieChart)`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          genderRiskLevels === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {genderRiskLevels === option && <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>}
                      </span>
                      <span className="text-sm text-[#C69749]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading.riskLevels ? 'filter blur-sm' : ''}`}>
                {filteredRiskLevels.length === 0 && !isLoading.riskLevels && (
                  <div className="p-2 text-center text-gray-400">No risk levels data available</div>
                )}
                {isLoading.riskLevels && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                {filteredRiskLevels.length > 0 && (
                  <PieChartComponent
                    data={filteredRiskLevels}
                    dataKey="value"
                    nameKey="name"
                    colors={['#FF6B6B', '#FFD166', '#06D6A0', '#4A90E2', '#F5A623']}
                    title="Risk Level Distribution"
                  />
                )}
                {errors.riskLevels && <div className="text-red-500 text-center mt-2">{errors.riskLevels}</div>}
              </div>
            </div>

            <div className="relative">
              <h4 className="text-md mb-4 text-[#C69749] font-bold text-[25px] text-center">Risk Levels for Predicted Diseases</h4>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#C69749] mb-2">Filter by Gender for Risk Levels (BarChart)</h4>
                <div className="flex space-x-4">
                  {(['All', 'Male', 'Female'] as const).map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="genderRiskLevelsTable"
                        value={option}
                        checked={genderRiskLevelsTable === option}
                        onChange={() => setGenderRiskLevelsTable(option)}
                        className="hidden"
                        aria-label={`Select ${option} gender filter for Risk Levels (BarChart)`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          genderRiskLevelsTable === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {genderRiskLevelsTable === option && <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>}
                      </span>
                      <span className="text-sm text-[#C69749]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading.riskLevelsTable ? 'filter blur-sm' : ''}`}>
                {filteredRiskLevelsTable.length === 0 && !isLoading.riskLevelsTable && (
                  <div className="p-2 text-center text-gray-400">No risk levels available</div>
                )}
                {isLoading.riskLevelsTable && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                {filteredRiskLevelsTable.length > 0 && (
                  <BarChartComponent
                    data={filteredRiskLevelsTable}
                    dataKey="value"
                    xAxisKey="name"
                    
                    barColors={['#FF6B6B', '#FFD166', '#06D6A0', '#4A90E2', '#F5A623']}
                    title="Risk Levels for Predicted Diseases"
                  />
                )}
                {errors.riskLevelsTable && <div className="text-red-500 text-center mt-2">{errors.riskLevelsTable}</div>}
              </div>
            </div>

            <div className="relative">
              <h4 className="text-md mb-4 text-[#C69749] font-bold text-[25px] text-center">Cures Suggested for Diseases</h4>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#C69749] mb-2">Filter by Gender for Cures</h4>
                <div className="flex space-x-4">
                  {(['All', 'Male', 'Female'] as const).map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="genderMedicine"
                        value={option}
                        checked={genderMedicine === option}
                        onChange={() => setGenderMedicine(option)}
                        className="hidden"
                        aria-label={`Select ${option} gender filter for Medicine`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          genderMedicine === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {genderMedicine === option && <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>}
                      </span>
                      <span className="text-sm text-[#C69749]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading.medicine ? 'filter blur-sm' : ''}`}>
                {isLoading.medicine && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-[#C69749] border border-[#735F32] rounded-lg">
                    <thead className="bg-[#282A3A] sticky top-0">
                      <tr>
                        <th className="p-2 text-left border-b border-[#735F32] capitalize">Cures</th>
                        <th className="p-2 text-right border-b border-[#735F32]">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicine.length > 0 ? (
                        filteredMedicine.map((medicine, i) => (
                          <tr key={i} className="bg-[#1e1e2d] hover:bg-[#282A3A]">
                            <td className="p-2 capitalize border-b border-[#735F32]">{medicine.name}</td>
                            <td className="p-2 text-right border-b border-[#735F32]">{medicine.count}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="p-2 text-center">No Cures suggested</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {errors.medicine && <div className="text-red-500 text-center mt-2">{errors.medicine}</div>}
              </div>
            </div>

            <div className="relative">
              <div className="mb-4">
                <h4 className="text-md mb-2 text-[#C69749] font-bold text-[25px] text-center">Top Predicted Diseases</h4>
                <h4 className="text-sm font-medium text-[#C69749] mb-2">Filter by Gender for Top Conditions</h4>
                <div className="flex space-x-4">
                  {(['All', 'Male', 'Female'] as const).map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="genderCategories"
                        value={option}
                        checked={genderCategories === option}
                        onChange={() => setGenderCategories(option)}
                        className="hidden"
                        aria-label={`Select ${option} gender filter for Top Conditions`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border-2 border-[#735F32] flex items-center justify-center ${
                          genderCategories === option ? 'bg-[#C69749]' : 'bg-[#282A3A]'
                        }`}
                      >
                        {genderCategories === option && <span className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]"></span>}
                      </span>
                      <span className="text-sm text-[#C69749]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={`bg-[#282A3A] p-4 rounded-lg shadow-md transition-all duration-300 ${isLoading.categories ? 'filter blur-sm' : ''}`}>
                {isLoading.categories && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#C69749] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-[#C69749] text-lg">Loading...</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="bg-[#282A3A] sticky top-0 flex justify-between p-2 border-b border-[#735F32]">
                    <span className="text-left text-sm font-medium text-[#C69749] capitalize">Disease</span>
                    <span className="text-right text-sm font-medium text-[#C69749]">Count</span>
                  </div>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 bg-[#1e1e2d] rounded-lg hover:bg-[#282A3A]"
                      >
                        <span className="text-sm text-[#C69749] capitalize">{item.name}</span>
                        <span className="text-sm text-[#C69749]">{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-400">No data available</div>
                  )}
                </div>
                {errors.categories && <div className="text-red-500 text-center mt-2">{errors.categories}</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}