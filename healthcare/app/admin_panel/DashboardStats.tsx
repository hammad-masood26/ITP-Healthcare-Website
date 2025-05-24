import { Card, CardContent } from '../ui/card';
import { Users, Activity, Brain, MessageCircle, Stethoscope, MessageSquareText, Loader2 } from 'lucide-react';
import { StatItem } from './types';

const iconMap = {
  users: <Users className="text-[#C69749]" size={20} />,
  disease_predictions: <Activity className="text-[#C69749]" size={20} />,
  medical_condition_predictions: <Stethoscope className="text-[#C69749]" size={20} />,
  mental_health_assessments: <Brain className="text-[#C69749]" size={20} />,
  chatbot_interactions: <MessageCircle className="text-[#C69749]" size={20} />,
  feedbacks: <MessageSquareText className="text-[#C69749]" size={20} />
};

export default function DashboardStats({ stats, loading }: { stats: StatItem; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Object.entries(stats).map(([key, value]) => (
        <Card key={key} className="bg-[#1e1e2d] border border-[#735F32] rounded-xl hover:shadow-lg transition-shadow">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
              <h2 className="text-2xl font-bold text-[#C69749]">
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  value.toLocaleString()
                )}
              </h2>
            </div>
            <div className="p-2 bg-[#282A3A] rounded-full">
              {iconMap[key as keyof typeof iconMap]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}