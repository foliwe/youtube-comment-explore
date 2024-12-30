import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { CommentStats } from '@/utils/statistics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

interface StatisticsProps {
  stats: CommentStats;
}

export default function Statistics({ stats }: StatisticsProps) {
  // Activity Over Time Chart Data
  const activityData = useMemo(() => {
    const dates = Object.keys(stats.commentsByDate).sort();
    return {
      labels: dates,
      datasets: [
        {
          label: 'Comments',
          data: dates.map(date => stats.commentsByDate[date]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  }, [stats.commentsByDate]);

  // Comment Length Distribution Chart Data
  const lengthDistributionData = useMemo(() => {
    const categories = Object.keys(stats.commentLengthDistribution).sort();
    return {
      labels: categories,
      datasets: [
        {
          label: 'Number of Comments',
          data: categories.map(cat => stats.commentLengthDistribution[cat]),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  }, [stats.commentLengthDistribution]);

  // Engagement by Hour Chart Data
  const engagementData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return {
      labels: hours.map(h => `${h}:00`),
      datasets: [
        {
          label: 'Activity',
          data: hours.map(hour => stats.engagementByHour[hour] || 0),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
      ],
    };
  }, [stats.engagementByHour]);

  // Reply Chain Distribution Chart Data
  const replyChainData = useMemo(() => {
    const chainLengths = Object.keys(stats.replyChainLengths).map(Number).sort((a, b) => a - b);
    return {
      labels: chainLengths.map(length => length === 0 ? 'No replies' : `${length} ${length === 1 ? 'reply' : 'replies'}`),
      datasets: [
        {
          data: chainLengths.map(length => stats.replyChainLengths[length]),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
        },
      ],
    };
  }, [stats.replyChainLengths]);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total Engagement</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2">
            <div>
              <dt className="text-sm text-gray-500">Total Comments</dt>
              <dd className="text-2xl font-semibold text-blue-600">{stats.totalComments}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total Likes</dt>
              <dd className="text-2xl font-semibold text-green-600">{stats.totalLikes}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total Replies</dt>
              <dd className="text-2xl font-semibold text-purple-600">{stats.totalReplies}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Averages</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2">
            <div>
              <dt className="text-sm text-gray-500">Likes per Comment</dt>
              <dd className="text-2xl font-semibold text-blue-600">
                {stats.averageLikes.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Replies per Comment</dt>
              <dd className="text-2xl font-semibold text-green-600">
                {stats.averageReplies.toFixed(1)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Top Commenters</h3>
          <ul className="mt-2 space-y-1">
            {stats.topCommenters.slice(0, 5).map(({ author, count }) => (
              <li key={author} className="flex justify-between items-center text-sm">
                <span className="truncate">{author}</span>
                <span className="font-medium text-gray-600">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Over Time */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Over Time</h3>
          <div className="h-64">
            <Line data={activityData} options={chartOptions} />
          </div>
        </div>

        {/* Comment Length Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comment Length Distribution</h3>
          <div className="h-64">
            <Bar data={lengthDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Engagement by Hour */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity by Hour</h3>
          <div className="h-64">
            <Bar data={engagementData} options={chartOptions} />
          </div>
        </div>

        {/* Reply Chain Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reply Chain Distribution</h3>
          <div className="h-64">
            <Doughnut data={replyChainData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
