import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Analytics } from '../services/api';

interface AnalyticsDashboardProps {
  analytics: (Analytics & { top_messages?: { message: string; count: number }[] }) | null;
  isLoading: boolean;
  onLevelClick?: (level: string) => void;
}

const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981'];

// --- CSV Export Utility ---
function downloadAnalyticsCSV(analytics: any) {
  if (!analytics) return;
  let csv = '';
  // Level Distribution
  if (analytics.level_distribution) {
    csv += 'Level Distribution\nLevel,Count\n';
    (Array.isArray(analytics.level_distribution) ? analytics.level_distribution : Object.values(analytics.level_distribution)).forEach((row: any) => {
      csv += `${row.name || row.level},${row.value || row.count}\n`;
    });
    csv += '\n';
  }
  // Daily Counts
  if (analytics.daily_counts) {
    csv += 'Daily Log Counts\nDate,Count\n';
    (Array.isArray(analytics.daily_counts) ? analytics.daily_counts : Object.values(analytics.daily_counts)).forEach((row: any) => {
      csv += `${row.date},${row.count}\n`;
    });
    csv += '\n';
  }
  // Top Messages
  if (analytics.top_messages) {
    csv += 'Top Frequent Log Messages\nMessage,Count\n';
    analytics.top_messages.forEach((row: any) => {
      csv += `"${row.message}",${row.count}\n`;
    });
    csv += '\n';
  }
  // Hourly Counts by Level
  if (analytics.hourly_counts_by_level) {
    csv += 'Hourly Log Counts by Level\nDate,Hour,INFO,ERROR,WARNING,DEBUG\n';
    Object.entries(analytics.hourly_counts_by_level).forEach(([date, arr]: any) => {
      arr.forEach((row: any) => {
        csv += `${date},${row.hour},${row.INFO},${row.ERROR},${row.WARNING},${row.DEBUG}\n`;
      });
    });
    csv += '\n';
  }
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analytics_export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics, isLoading, onLevelClick }) => {
  if (isLoading) return <div className="text-center py-8 text-primary animate-pulse">Loading analytics...</div>;
  if (!analytics) return <div className="text-center py-8 text-gray-400">No analytics data</div>;

  // Transform level_distribution to array if it's an object
  const levelData = analytics.level_distribution
    ? Array.isArray(analytics.level_distribution)
      ? analytics.level_distribution
      : Object.entries(analytics.level_distribution).map(([level, value]) => ({ level, value }))
    : [];

  // Transform daily_counts to array if it's an object
  const dailyData = analytics.daily_counts
    ? Array.isArray(analytics.daily_counts)
      ? analytics.daily_counts
      : Object.entries(analytics.daily_counts).map(([date, count]) => ({ date, count }))
    : [];

  return (
    <>
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <button
          className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition float-right"
          onClick={() => downloadAnalyticsCSV(analytics)}
          title="Download Analytics CSV"
          aria-label="Download Analytics CSV"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
        </button>
      </div>
      <div className="grid gap-8 mt-4">
        {/* Log Level Distribution */}
        <div className="card fade-in">
          <h3 className="text-lg font-bold mb-4 flex items-center"><span className="material-icons mr-2 text-primary" aria-label="Log Level Distribution Pie Chart" title="Log Level Distribution Pie Chart"></span>Log Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart onClick={() => console.log('PieChart clicked!')}>
              <Pie
                data={levelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                onClick={(_, idx) => {
                  console.log('Pie segment clicked', idx, levelData[idx]);
                  if (onLevelClick && typeof idx === 'number' && levelData[idx] && levelData[idx].name) {
                    onLevelClick(levelData[idx].name);
                  }
                }}
              >
                {levelData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Daily Log Count */}
        <div className="card fade-in">
          <h3 className="text-lg font-bold mb-4 flex items-center"><span className="material-icons mr-2 text-accent" aria-label="Daily Log Count Bar Chart" title="Daily Log Count Bar Chart"></span>Daily Log Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Top N Frequent Log Messages Bar Chart */}
        <div className="card fade-in">
          <h3 className="text-lg font-bold mb-4 flex items-center"><span className="material-icons mr-2 text-accent" aria-label="Top Log Messages Bar Chart" title="Top Log Messages Bar Chart"></span>Top 5 Frequent Log Messages</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.top_messages && analytics.top_messages.length > 0 ? analytics.top_messages : [
              { message: 'Database connection lost', count: 10 },
              { message: 'User login failed', count: 7 },
              { message: 'Timeout occurred', count: 5 },
              { message: 'File not found', count: 4 },
              { message: 'Unknown error', count: 2 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="message" type="category" width={180}/>
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Log Levels by Hour (selectable date) */}
        <LogLevelsByHourChart analytics={analytics} />
      </div>
    </>
  );
};

// --- Extra Component: LogLevelsByHourChart ---
import { useState } from 'react';

const sampleHourlyData: Record<string, { hour: number; INFO: number; ERROR: number; DEBUG: number }[]> = {
  '2023-09-01': [
    { hour: 0, INFO: 2, ERROR: 0, DEBUG: 1 },
    { hour: 1, INFO: 1, ERROR: 1, DEBUG: 0 },
    { hour: 2, INFO: 3, ERROR: 0, DEBUG: 2 },
    { hour: 3, INFO: 2, ERROR: 1, DEBUG: 1 },
    { hour: 4, INFO: 0, ERROR: 0, DEBUG: 0 },
    { hour: 5, INFO: 1, ERROR: 0, DEBUG: 0 },
    { hour: 6, INFO: 2, ERROR: 0, DEBUG: 1 },
    { hour: 7, INFO: 4, ERROR: 1, DEBUG: 2 },
    { hour: 8, INFO: 3, ERROR: 0, DEBUG: 1 },
    { hour: 9, INFO: 2, ERROR: 2, DEBUG: 0 },
    { hour: 10, INFO: 1, ERROR: 1, DEBUG: 1 },
    { hour: 11, INFO: 0, ERROR: 0, DEBUG: 0 },
    { hour: 12, INFO: 2, ERROR: 0, DEBUG: 1 },
    { hour: 13, INFO: 1, ERROR: 1, DEBUG: 0 },
    { hour: 14, INFO: 3, ERROR: 0, DEBUG: 2 },
    { hour: 15, INFO: 2, ERROR: 1, DEBUG: 1 },
    { hour: 16, INFO: 0, ERROR: 0, DEBUG: 0 },
    { hour: 17, INFO: 1, ERROR: 0, DEBUG: 0 },
    { hour: 18, INFO: 2, ERROR: 0, DEBUG: 1 },
    { hour: 19, INFO: 4, ERROR: 1, DEBUG: 2 },
    { hour: 20, INFO: 3, ERROR: 0, DEBUG: 1 },
    { hour: 21, INFO: 2, ERROR: 2, DEBUG: 0 },
    { hour: 22, INFO: 1, ERROR: 1, DEBUG: 1 },
    { hour: 23, INFO: 0, ERROR: 0, DEBUG: 0 },
  ],
  '2023-09-02': [
    { hour: 0, INFO: 1, ERROR: 0, DEBUG: 0 },
    { hour: 1, INFO: 2, ERROR: 0, DEBUG: 1 },
    { hour: 2, INFO: 0, ERROR: 1, DEBUG: 0 },
    // ...
  ],
};

const LogLevelsByHourChart: React.FC<{ analytics: any }> = ({ analytics }) => {
  // Prefer backend analytics.hourly_counts_by_level, fallback to sampleHourlyData
  const backendData = analytics && analytics.hourly_counts_by_level ? analytics.hourly_counts_by_level : undefined;
  const availableDates = backendData ? Object.keys(backendData) : Object.keys(sampleHourlyData);
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const data = backendData && backendData[selectedDate] ? backendData[selectedDate] : sampleHourlyData[selectedDate];
  return (
    <div className="card fade-in">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <span className="material-icons mr-2 text-accent" aria-label="Log Levels by Hour Line Chart" title="Log Levels by Hour Line Chart"></span>
        Log Levels by Hour (select date)
      </h3>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Date:</label>
        <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded px-2 py-1">
          {availableDates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="INFO" stroke="#0ea5e9" />
          <Line type="monotone" dataKey="ERROR" stroke="#ef4444" />
          <Line type="monotone" dataKey="WARNING" stroke="#f59e0b" />
          <Line type="monotone" dataKey="DEBUG" stroke="#10b981" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
