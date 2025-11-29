export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  title?: string;
  className?: string;
}


export type MedicalBotallData = {
  userName: string;
  date: string;
  userMessage: string;
  botResponse: string;
  serialNo: number;
  categroryQuestion?: string; 
};

export interface StructuredData {
  date?: string | null;
  cures?: string | null;
  doctor?: string | null;
  disease?: string | null;
  userName?: string | null;
  riskLevel?: string | null;
  inputDescription?: string | null;
  serialNo?: number | null;
  userMessage?: string | null;
  botResponse?: string | null;
  condition?: string | null;
}
export type mentalData = {
  userName: string;
  date: string;
  userMessage: string;
  botResponse: string;
  serialNo: number;
  condition?: string; // Add condition as an optional field
};

export interface StatItem {
  users: number;
  disease_predictions: number;
  medical_condition_predictions: number;
  mental_health_assessments: number;
  chatbot_interactions?: number;
  feedbacks: number;
  active_today?: number;
  active_week?: number;
  new_users_week?: number;
  retention_rate?: number;
}

export interface TrendItem {
  date: string;
  count: number;
}

export type TrendData = TrendItem[];

export interface CategoryItem {
  name: string;
  count: number;
}

export type CategoryData = CategoryItem[];

export interface ValueItem {
  label: string;
  value: number;
}
export type Diseasealldata = StructuredData;
export type ValueData = ValueItem[];

export type RiskLevelData = ValueItem[];

export interface FeedbackSentimentItem {
  label: string; // e.g., "Positive", "Neutral", "Negative"
  value: number;
}

export type FeedbackSentiment = CategoryItem[];

export interface FeedbackItem {
  _id: string;
  name?: string;
  email?: string;
  message?: string;
  timestamp?: string;
  reply?: string;
  replyTimestamp?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface FeedbackAllData {
  name?: string;
  date?: string;
  message?: string;
  email?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  reply?: string;
}

export interface LogItem {
  email: string;
  feature: string;
  timestamp: string;
  userId?: string;
}

export interface UserActivityPoint {
  date: string;
  count: number;
  uniqueUsers?: number;
}

export type UserActivityData = UserActivityPoint[];

export interface BotInteractionCategory {
  name: string;
  count: number;
}

export type BotInteractionData = BotInteractionCategory[];

export interface DiseaseDoctor {
  name: string;
  count: number;
}

export interface DiseaseMedicine {
  name: string;
  count: number;
}

export interface DiseaseAllData {
  name?: string;
  count?: number;
  date?: string;
  cures?: string;
  doctor?: string;
  disease?: string;
  userName?: string;
  riskLevel?: string;
  inputDescription?: string;
  serialNo?: number;
}

export interface MentalData {
  userName: string;
  date: string;
  userMessage: string;
  botResponse: string;
  serialNo: number;
  condition?: string;
}

export interface MedicalBotAllData {
  userName: string;
  date: string;
  userMessage: string;
  botResponse: string;
  serialNo: number;
  categoryQuestion?: string;
}

export interface UserInsight {
  active_today: number;
  active_week: number;
  new_users_week: number;
  retention_rate: number;
}

export interface DashboardData {
  diseaseTrends: TrendData;
  mentalHealthTrends: TrendData;
  medicalBotTrends: TrendData;
  chatbotTrends?: TrendData;
  userGrowth: TrendData;
  userActivity: UserActivityData;
  diseaseCategories: CategoryData;
  medicalBotCategories: BotInteractionData;
  diseaseDoctors: DiseaseDoctor[];
  diseaseMedicine: DiseaseMedicine[];
  diseasealldata: DiseaseAllData[];
  medicalBotalldata: MedicalBotAllData[];
  feedbackalldata: FeedbackAllData[];
  mentalalldata: MentalData[];
  
  mentalScores: ValueData;
  mentalHealthDistribution: ValueData;
  diseaseRiskLevels: RiskLevelData;
  feedbackSentiment: FeedbackSentiment; // Made optional with ?
  recentLogs: LogItem[];
  feedbackComments: FeedbackItem[];
  stats?: StatItem;
  userInsights?: UserInsight;
}

export interface ChartDataProps {
  data: TrendData | CategoryData | ValueData | RiskLevelData | BotInteractionData;
  dataKey: string;
  xAxisKey?: string;
  nameKey?: string;
  colors?: string[];
  className?: string;
  title?: string;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}