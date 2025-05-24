'use client';
import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { StatItem, DashboardData, FeedbackItem, FeedbackAllData, FeedbackSentiment } from '../types';
import { Reply, Send, Loader2 } from 'lucide-react';
import PieChartComponent from '../charts/PieChartComponent';

interface FeedbackItemProps {
  feedback: FeedbackItem;
  onReplySubmit: (feedbackId: string, message: string) => Promise<boolean>;
}

const FeedbackItemComponent = ({ feedback, onReplySubmit }: FeedbackItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setError('Reply message cannot be empty.');
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const success = await onReplySubmit(feedback._id, replyMessage);
      if (success) {
        setIsReplying(false);
        setReplyMessage('');
      } else {
        setError('Failed to send reply. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while sending the reply.');
      console.error('Reply submission error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date unavailable';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  return (
    <div className="p-4 bg-[#282A3A] rounded-lg border border-[#735F32]">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-[#C69749]">{feedback.name || 'Anonymous'}</p>
          <p className="text-sm text-gray-400">{feedback.email || 'Unknown'}</p>
        </div>
        <p className="text-xs text-[#C69749]">{formatDate(feedback.timestamp)}</p>
      </div>
      <p className="mt-2 text-sm text-gray-200">{feedback.message || 'No message'}</p>

      {feedback.reply && (
        <div className="mt-3 p-3 bg-[#1e1e2d] rounded-lg border-l-4 border-[#C69749]">
          <div className="flex items-center gap-2 text-sm text-[#C69749] mb-1">
            <Reply size={14} />
            <span>Admin Response</span>
          </div>
          <p className="text-sm text-gray-200">{feedback.reply}</p>
          {feedback.replyTimestamp && (
            <p className="text-xs text-gray-400 mt-1">
              Replied on: {formatDate(feedback.replyTimestamp)}
            </p>
          )}
        </div>
      )}

      {!feedback.reply && (
        <div className="mt-3">
          {isReplying ? (
            <div className="space-y-2">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full p-2 bg-[#282A3A] border border-[#735F32] rounded text-sm text-gray-200 focus:outline-none focus:border-[#C69749]"
                placeholder="Type your response here..."
                rows={3}
                aria-label="Reply to feedback"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyMessage('');
                    setError(null);
                  }}
                  className="px-3 py-1 text-sm bg-gray-600 rounded hover:bg-gray-500 transition-colors"
                  aria-label="Cancel reply"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={isSending}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 transition-colors ${
                    isSending ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#C69749] hover:bg-[#B1873A]'
                  }`}
                  aria-label="Send reply"
                >
                  {isSending ? (
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
              onClick={() => setIsReplying(true)}
              className="flex items-center gap-1 text-sm text-[#C69749] hover:text-[#B1873A] transition-colors"
              aria-label={`Reply to feedback from ${feedback.name || 'Anonymous'}`}
            >
              <Reply size={14} />
              Reply to Feedback
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function FeedbackTab({
  stats,
  data,
  onReplySubmit,
}: {
  stats: StatItem;
  data: DashboardData;
  onReplySubmit: (feedbackId: string, message: string) => Promise<boolean>;
}) {
  const [feedbackAllData] = useState<FeedbackAllData[]>(data.feedbackalldata || []);
  const [feedbackSentiment] = useState<FeedbackSentiment>(data.feedbackSentiment || []);
  const hasFeedback = data.feedbackComments && data.feedbackComments.length > 0;
  const hasSentimentData = feedbackSentiment.some(item => item.count > 0);
  const displayPieChartData = !hasSentimentData && hasFeedback
  ? feedbackSentiment.map(item => ({ ...item, value: item.count === 0 ? 1 : item.count }))
  : feedbackSentiment;


  return (
    <div className="space-y-6">
      {/* Feedback Data Table */}
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4 font-bold text-[25px] text-center">All Feedback Data</h3>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm text-[#C69749] border border-[#735F32] rounded-lg">
              <thead className="bg-[#282A3A] sticky top-0">
                <tr>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Date</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Name</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Email</th>
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Message</th>
                 
                  <th scope="col" className="p-2 text-left border-b border-[#735F32] capitalize">Status</th>
                </tr>
              </thead>
              <tbody>
                {feedbackAllData.length > 0 ? (
                  feedbackAllData.map((feedback, i) => (
                    <tr key={i} className="bg-[#1e1e2d] hover:bg-[#282A3A]">
                      <td className="p-2 border-b border-[#735F32]">
                        {feedback.date ? new Date(feedback.date).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-2 border-b border-[#735F32]">{feedback.name || 'Anonymous'}</td>
                      <td className="p-2 border-b border-[#735F32]">{feedback.email || 'Anonymous'}</td>
                      <td className="p-2 border-b border-[#735F32] truncate max-w-xs">{feedback.message || 'No message'}</td>
                      
                      <td className="p-2 border-b border-[#735F32]">
                        {feedback.reply ? (
                          <span className="text-green-400">Replied</span>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-2 text-center text-gray-400">
                      No feedback data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Pie Chart */}
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4 font-bold text-[25px] text-center">Feedback Sentiment Distribution</h3>
          {hasFeedback || hasSentimentData ? (

                <PieChartComponent
                  data={displayPieChartData}
                  dataKey="count" // Updated to match FeedbackSentimentItem structure
                  nameKey="name" // Updated to match FeedbackSentimentItem structure
                  colors={['rgb(100, 218, 49)', 'rgb(255, 231, 77)', 'rgb(189, 0, 25)']}
                  title="Sentiment Distribution"
                  
                />

          ) : (
            <p className="text-sm text-gray-400 text-center">No sentiment data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Feedback Comments with Reply System */}
      <Card className="bg-[#1e1e2d] border border-[#735F32] rounded-xl">
        <CardContent className="p-4">
          <h3 className="text-lg text-[#C69749] mb-4 font-bold text-[25px] text-center">User Feedback & Comments</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2 text-[#C69749] text-center">
                Total Feedback: {stats.feedbacks || 0}
              </h4>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {data.feedbackComments && data.feedbackComments.length > 0 ? (
                  data.feedbackComments.map((feedback) => (
                    <FeedbackItemComponent
                      key={feedback._id}
                      feedback={feedback}
                      onReplySubmit={onReplySubmit}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center">No feedback available.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}