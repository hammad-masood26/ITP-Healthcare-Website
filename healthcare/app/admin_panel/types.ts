// /**
//  * Core statistics that appear in the dashboard stats cards
//  */
// export type StatItem = {
//   users: number;
//   disease_predictions: number;
//   medical_condition_predictions: number;
//   mental_health_assessments: number;
//   chatbot_interactions?: number; // Optional, not in backend basic_stats
//   feedbacks: number;
//   active_today?: number;
//   active_week?: number;
//   new_users_week?: number;
//   retention_rate?: number;
// };

// /**
//  * Data structure for time series charts (line/area charts)
//  */
// export type TrendDataPoint = {
//   date: string; // ISO date string (e.g., "2025-05-15")
//   count: number;
// };

// export type TrendData = TrendDataPoint[];

// /**
//  * Data structure for categorical charts (bar/pie charts)
//  */
// export type CategoryDataPoint = {
//   name: string; // Category name (e.g., "Pain Related")
//   count: number;
// };

// export type CategoryData = CategoryDataPoint[];

// /**
//  * Data structure for value-based charts (pie charts)
//  */
// export type ValueDataPoint = {
//   label: string; // Label (e.g., "Suicidal")
//   value: number;
// };

// export type ValueData = ValueDataPoint[];

// /**
//  * Risk level distribution data
//  */
// export type RiskLevelData = {
//   name: string; // Risk level (e.g., "High")
//   value: number;
// }[];

// /**
//  * Feedback sentiment analysis
//  */
// export type FeedbackSentiment = {
//   positive: number;
//   neutral: number;
//   negative: number;
// };

// /**
//  * Feedback item structure
//  */
// export type FeedbackItem = {
//   _id?: string; // Optional, not in get_recent_feedback
//   name: string;
//   email: string;
//   message: string;
//   timestamp: string; // ISO date string
//   reply?: string;
//   replyTimestamp?: string; // ISO date string
//   sentiment?: 'positive' | 'neutral' | 'negative';
// };

// /**
//  * System log item structure
//  */
// export type LogItem = {
//   email: string;
//   feature: string;
//   timestamp: string; // ISO date string
//   userId?: string;
// };

// /**
//  * User activity data point
//  */
// export type UserActivityPoint = {
//   date: string; // ISO date string
//   count: number;
//   uniqueUsers?: number;
// };

// export type UserActivityData = UserActivityPoint[];

// /**
//  * Medical bot interaction category
//  */
// export type BotInteractionCategory = {
//   name: string; // Category name (e.g., "Pain Related")
//   count: number;
//   percentage?: number; // Optional, not in backend
//   gender?: 'Male' | 'Female' | null; // Optional, for frontend filtering
// };

// export type BotInteractionData = BotInteractionCategory[];

// /**
//  * Disease doctor data
//  */
// export type DiseaseDoctor = {
//   name: string; // Doctor name (e.g., "Not Prescribed")
//   count: number; // Number of prescriptions
// };

// /**
//  * Disease medicine data
//  */
// export type DiseaseMedicine = {
//   name: string; // Medicine name (e.g., "Not Prescribed")
//   count: number; // Number of prescriptions
// };

// export type Diseasealldata = {
//   name: string; // Identifier (e.g., document ID)
//   count: number; // Number of occurrences (for aggregation)
//   date: string; // ISO date string (e.g., "2025-04-22")
//   cures: string; // e.g., "Surgery chemotherapy radiation therapy"
//   doctor: string; // e.g., "Family doctor urgent care"
//   disease: string; // e.g., "Fever"
//   userName: string; // e.g., "jsfduics"
//   riskLevel: string; // e.g., "Varies"
//   inputDescription: string; // e.g., "headache, nose bleeding, body pain"
//   serialNo: number; // e.g., 1
// };



// export type mentalData = {
//   userName: string;
//   date: string;
//   userMessage: string;
//   botResponse: string;
//   serialNo: number;
// };







// /**
//  * Comprehensive dashboard data structure
//  */
// export type DashboardData = {
//   // Time series data
//   diseaseTrends: TrendData;
//   mentalHealthTrends: TrendData;
//   medicalBotTrends: TrendData;
//   chatbotTrends?: TrendData; // Optional, not in backend
//   userGrowth: TrendData;
//   userActivity: UserActivityData;
  
//   // Categorical data
//   diseaseCategories: CategoryData;
//   medicalBotCategories: BotInteractionData;
//   diseaseDoctors: DiseaseDoctor[];
//   diseaseMedicine: DiseaseMedicine[];
//   diseasealldata:Diseasealldata[];
  
//   // Value-based data
//   mentalalldata:mentalData[];
//   mentalScores: ValueData;
//   mentalHealthDistribution: ValueData;
//   diseaseRiskLevels: RiskLevelData;
  
//   // Sentiment analysis
//   feedbackSentiment: FeedbackSentiment;
  
//   // Recent activity
//   recentLogs: LogItem[];
//   feedbackComments: FeedbackItem[];
//   stats?: StatItem;
//   // User insights (optional, maps to basic_stats)
//   userInsights?: {
//     active_today: number;
//     active_week: number;
//     new_users_week: number;
//     retention_rate: number;
//   };
// };

// /**
//  * Type for individual stat card props
//  */
// export type StatCardProps = {
//   title: string;
//   value: number | string;
//   icon: React.ReactNode;
//   trend?: number; // Percentage change
//   loading?: boolean;
// };

// /**
//  * Chart data props for reusable chart components
//  */
// export type ChartDataProps = {
//   data: TrendData | CategoryData | ValueData | RiskLevelData | BotInteractionData;
//   // dataKey: string; // Key for y-axis or value (e.g., "count")
//   // xAxisKey?: string; // Key for x-axis (e.g., "date")
//   nameKey?: string; // Key for labels (e.g., "name")
//   colors?: string[];
//   className?: string;
//   dataKey: keyof TrendData; // 'date' | 'count'
//   xAxisKey: keyof TrendData;
//   title?: string;
// };










// MedicalBotallData
// export interface StatItem {
//   users: number;
//   disease_predictions: number;
//   medical_condition_predictions: number;
//   mental_health_assessments: number;
//   chatbot_interactions: number;
//   feedbacks: number;
// }

// export interface TrendItem {
//   date: string;
//   count: number;
// }

// export interface CategoryItem {
//   name: string;
//   count: number;
// }

// export interface DistributionItem {
//   label: string;
//   value: number;
// }

// export interface UserInsight {
//   active_today: number;
//   active_week: number;
//   new_users_week: number;
//   retention_rate: number;
// }



// export interface LogItem {
//   email: string;
//   feature: string;
//   timestamp: string;
// }

// export interface FeedbackItem {
//   _id: string;
//   name: string;
//   email: string;
//   message: string;
//   timestamp: string;
//   reply?: string;
//   replyTimestamp?: string;
// }

// export interface FeedbackComment {
//   name: string;
//   email: string;
//   message: string;
//   timestamp: string;
// }

// export interface StructuredData {
//   date?: string | null;
//   cures?: string | null;
//   doctor?: string | null;
//   disease?: string | null;
//   userName?: string | null;
//   riskLevel?: string | null;
//   inputDescription?: string | null;
//   serialNo?: number | null;
//   userMessage?: string | null;
//   botResponse?: string | null;
//   condition?: string | null;
// }

// export type BotInteractionCategory = {
//   name: string; // Category name (e.g., "Pain Related")
//   count: number;
//   percentage?: number; // Optional, not in backend
//   gender?: 'Male' | 'Female' | null; // Optional, for frontend filtering
// };

// // Update mentalData to include condition
// export type mentalData = {
//   userName: string;
//   date: string;
//   userMessage: string;
//   botResponse: string;
//   serialNo: number;
//   condition?: string; // Add condition as an optional field
// };

// export type MedicalBotallData = {
//   userName: string;
//   date: string;
//   userMessage: string;
//   botResponse: string;
//   serialNo: number;
//   categroryQuestion?: string; 
// };
// export type feedbackallData = {
//   user: string;
//   date: string;
//   message: string;
//   email: string;
// };

// // Update StructuredData to include condition and align with mentalData
// export type ValueDataPoint = {
//   label: string; // Label (e.g., "Suicidal")
//   value: number;
// };


// export interface FeedbackSentimentItem {
//   label: string; // e.g., "Positive", "Neutral", "Negative"
//   value: number;
// }
// export type UserActivityPoint = {
//   date: string; // ISO date string
//   count: number;
//   uniqueUsers?: number;
// };



// export type BotInteractionData = BotInteractionCategory[];
// export type ValueData = ValueDataPoint[];
// export type TrendData = TrendItem[];
// export type CategoryData = CategoryItem[];
// export type RiskLevelData = DistributionItem[];
// export type DiseaseDoctor = CategoryItem;
// export type DiseaseMedicine = CategoryItem;
// export type FeedbackSentiment = FeedbackSentimentItem;
// export type Diseasealldata = StructuredData;
// export type medicalBotalldata = MedicalBotallData;
// export type feedbackalldata = feedbackallData;
// export type UserActivityData = UserActivityPoint[];
// // Update DashboardData to use mentalData for mentalalldata
// export type DashboardData = {
//   // Time series data
//   diseaseTrends: TrendData;
//   mentalHealthTrends: TrendData;
//   medicalBotTrends: TrendData;
//   chatbotTrends: TrendData ;
//   userGrowth: TrendData;
//   userActivity: UserActivityData;
  
//   // Categorical data
//   diseaseCategories: CategoryData;
//   medicalBotCategories: BotInteractionData;
//   diseaseDoctors: DiseaseDoctor[];
//   diseaseMedicine: DiseaseMedicine[];
//   feedbackSentiment?: FeedbackSentiment;
//   diseasealldata?: any[];
//   medicalBotalldata?: any[];
//   feedbackalldata?: any[];

//   // Value-based data
//   mentalalldata: mentalData[]; // Update to mentalData[]
//   mentalScores: ValueData;
//   mentalHealthDistribution: ValueData;
//   diseaseRiskLevels: RiskLevelData;
  
//   // Sentiment analysis
  
//   // Recent activity
//   recentLogs: LogItem[];
//   feedbackComments: FeedbackItem[];
//   stats?: StatItem;
//   userInsights?: {
//     active_today: number;
//     active_week: number;
//     new_users_week: number;
//     retention_rate: number;
//   };
// };


// export type ChartDataProps = {
//   data: TrendData | CategoryData | ValueData | RiskLevelData | BotInteractionData;
//   dataKey: string; // Key for y-axis or value (e.g., "count")
//   xAxisKey?: string; // Key for x-axis (e.g., "date") - optional
//   yAxisKey?: string; // Key for x-axis (e.g., "date") - optional
//   nameKey?: string; // Key for labels (e.g., "name")
//   colors?: string[];
//   className?: string;
//   title?: string; // Add title as an optional prop
// };


















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