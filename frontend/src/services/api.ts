import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

export const getFiles = async () => {
  const response = await axios.get<{ filename: string }[]>(`${API_URL}/files`);
  return response.data;
};

export interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  source_file: string;
  created_at: string;
}

export interface Analytics {
  level_distribution: Record<string, number>;
  daily_counts: Record<string, number>;
}

export const uploadLogFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/upload`, formData);
  return response.data;
};

export const getLogs = async (filters: {
  level?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  source_file?: string;
}) => {
  const response = await axios.get<LogEntry[]>(`${API_URL}/logs`, { params: filters });
  return response.data;
};

export const getAnalytics = async (source_file?: string) => {
  const response = await axios.get<Analytics>(`${API_URL}/analytics`, {
    params: source_file ? { source_file } : undefined
  });
  return response.data;
};
