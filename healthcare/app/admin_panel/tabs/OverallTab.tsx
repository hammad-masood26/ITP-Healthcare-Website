import { Card, CardContent } from '../../ui/card';
import { StatItem, DashboardData } from '../types';
import LineChartComponent from '../charts/LineChartComponent';
import BarChartComponent from '../charts/BarChartComponent';
import PieChartComponent from '../charts/PieChartComponent';

export default function OverallTab({ stats, data }: { stats: StatItem; data: DashboardData }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">User Growth</h3>
            <LineChartComponent data={data.userGrowth} dataKey="count" title='Users Activity'/>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Top Disease Predictions</h3>
            <BarChartComponent data={data.diseaseCategories}
                    dataKey="count"
                    yAxisKey='count'
                    xAxisKey="name" // Explicitly specify xAxisKey for clarity
                    // barColors={["#115f9a", "#1984c5", "#22a7f0", "#48b5c4", "#76c68f"]}
                    barColors={[
                      "#115f9a",
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
                    title="Disease" />
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Mental Health Distribution</h3>
            <PieChartComponent
              data={data.mentalHealthDistribution} // Updated to use distribution
              dataKey="value"
              nameKey="label"
              colors={['#C5172E', '#FFD166', '#FF6B6B', '#4A90E2', '#F5A623']}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
          <CardContent className="p-4">
            <h3 className="text-lg text-[#C69749] mb-4">Recent System Activity</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {data.recentLogs.map((log, i) => (
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
              {data.feedbackComments.slice(0, 5).map((feedback, i) => (
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
}