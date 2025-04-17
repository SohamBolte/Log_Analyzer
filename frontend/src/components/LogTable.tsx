import React from 'react';
import { format } from 'date-fns';
import { LogEntry } from '../services/api';

interface LogTableProps {
  logs: LogEntry[];
  isLoading: boolean;
}


export const LogTable: React.FC<LogTableProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">No logs found</div>
    );
  }

  // --- CSV Export Utility ---
  function downloadLogsCSV(logs: LogEntry[]) {
    if (!logs || logs.length === 0) return;
    let csv = 'Timestamp,Level,Message,Source\n';
    logs.forEach(log => {
      csv += `"${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}","${log.level}","${log.message.replace(/"/g, '""')}","${log.source_file || ''}"
`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-x-auto card fade-in">
      <div className="flex justify-end items-center mb-2">
        <button
          className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onClick={() => downloadLogsCSV(logs)}
          title="Download Filtered Logs as CSV"
          aria-label="Download Filtered Logs as CSV"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
        </button>
      </div>
      <table className="min-w-full border border-gray-300 dark:border-slate-700 rounded-xl overflow-hidden">
        <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-slate-700">Timestamp</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-slate-700">Level</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-slate-700">Message</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-slate-700">Source</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className={`transition-colors hover:bg-primary/10 dark:hover:bg-primary/20`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700">
                {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap border border-gray-300 dark:border-slate-700">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 90,
                    padding: '4px 14px',
                    fontWeight: 800,
                    fontSize: 14,
                    color: '#111',
                    textTransform: 'uppercase',
                    background:
                      log.level.toLowerCase() === 'debug' ? '#6fdc6f'
                      : log.level.toLowerCase() === 'info' ? '#2ec4f1'
                      : log.level.toLowerCase() === 'warning' ? '#ffd43b'
                      : log.level.toLowerCase() === 'error' ? '#ff713b'
                      : '#e5e7eb',
                    borderRadius: 9999,
                    boxShadow: '6px 10px 0 0 #2226, 0 1px 3px rgba(0,0,0,0.08)',
                    letterSpacing: 1,
                  }}
                >
                  {log.level}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700">
                <div className="max-w-lg truncate" title={log.message} tabIndex={0} aria-label={log.message}>
                  {log.message}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-slate-700">
                {log.source_file}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
