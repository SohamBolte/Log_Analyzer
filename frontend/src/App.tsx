import React from 'react';
import { FileUpload } from './components/FileUpload';
import { LogTable } from './components/LogTable';
import { LogFilters } from './components/LogFilters';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FileSelector } from './components/FileSelector';
import { getLogs, getAnalytics, getFiles, LogEntry, Analytics } from './services/api';
import { Toaster } from 'react-hot-toast';
import { FiUpload, FiBarChart2, FiList } from 'react-icons/fi';
import './App.css';
function App() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [files, setFiles] = React.useState<{ filename: string }[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = React.useState(false);
  const [filterRange, setFilterRange] = React.useState<{ min: string; max: string }>({ min: '', max: '' });

  // Fetch logs for display (with filters)
  const fetchLogs = React.useCallback(async (filters: { start_date?: string; end_date?: string; [key: string]: any } = {}) => {
    setIsLoading(true);
    try {
      const params = {
        ...filters,
        source_file: selectedFile,
        start_date: filters.start_date ? new Date(filters.start_date).toISOString() : undefined,
        end_date: filters.end_date ? new Date(filters.end_date).toISOString() : undefined
      };
      const data = await getLogs(params);
      console.log('Fetched logs:', data, 'with params:', params);
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      alert('Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  // Always fetch all logs for min/max calculation when selectedFile changes
  React.useEffect(() => {
    async function fetchRange() {
      if (selectedFile) {
        try {
          const allLogs = await getLogs({ source_file: selectedFile });
          if (allLogs.length > 0) {
            const timestamps = allLogs.map((log) => new Date(log.timestamp).getTime());
            const min = new Date(Math.min(...timestamps)).toISOString().slice(0, 16);
            const max = new Date(Math.max(...timestamps)).toISOString().slice(0, 16);
            setFilterRange({ min, max });
          } else {
            setFilterRange({ min: '', max: '' });
          }
        } catch (error) {
          setFilterRange({ min: '', max: '' });
        }
      } else {
        setFilterRange({ min: '', max: '' });
      }
    }
    fetchRange();
  }, [selectedFile]);

  const fetchAnalytics = React.useCallback(async () => {
    setIsAnalyticsLoading(true);
    try {
      const data = await getAnalytics(selectedFile);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [selectedFile]);

  const fetchFiles = React.useCallback(async () => {
    try {
      const fileList = await getFiles();
      setFiles(fileList);
      if (fileList.length > 0 && !selectedFile) {
        setSelectedFile(fileList[0].filename);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  }, [selectedFile]);

  const handleUploadSuccess = React.useCallback((uploadedFileName: string) => {
    fetchFiles();
    setSelectedFile(uploadedFileName); // Immediately select the uploaded file
    // fetchLogs and fetchAnalytics will be triggered by useEffect on selectedFile
  }, [fetchFiles]);

  const handleFilterChange = React.useCallback((filters: any) => {
    fetchLogs(filters);
  }, [fetchLogs]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  React.useEffect(() => {
    if (selectedFile) {
      fetchLogs();
      fetchAnalytics();
    }
  }, [selectedFile, fetchLogs, fetchAnalytics]);

  // Dark mode toggle logic
  const [dark, setDark] = React.useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  const logTableRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <main>
        <header>
          <div className="logo-title-row">
            <img src="/log-svgrepo-com (1).svg" alt="App Logo" className="app-logo" />
            <h1 className="app-title">Log Analyzer</h1>
          </div>
          <style>{`
            .logo-title-row {
              display: flex;
              align-items: center;
              gap: 1.2rem;
              margin-bottom: 0.5rem;
            }
            .app-logo {
              width: 60px;
              height: 60px;
              border-radius: 14px;
              background: #fff3;
              box-shadow: 0 2px 8px #0002;
              flex-shrink: 0;
            }
            .app-title {
              font-size: 2.7rem;
              font-weight: 900;
              letter-spacing: -1px;
              background: linear-gradient(90deg, #4f8cff 30%, #a6e1fa 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-fill-color: transparent;
              margin: 0;
              padding: 0;
              line-height: 1.1;
            }
          `}</style>
          <button
            className="filter-button ml-auto"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            type="button"
          >
            {dark ? '🌙' : '☀️'}
          </button>
          <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-slate-800 dark:text-primary-300 fade-in">
            {files.length} {files.length === 1 ? 'File' : 'Files'}
          </span>
        </header>
        <div className="app-description fade-in">
          <span className="desc-gradient">Dive into your application’s story</span>
          <span className="desc-secondary">—Upload, Explore, and Visualize Logs with ease. <br />Uncover trends, spot issues, and unlock hidden insights. <br />Transform raw data into clarity and opportunity, empowering you to make smarter, faster decisions.</span>
          <style>{`
            .app-description {
              margin-top: 0.8rem;
              font-size: 1.3rem;
              font-style: italic;
              font-weight: 500;
              line-height: 1.5;
              color: var(--text-label, #23293a);
              text-align: left;
              max-width: 700px;
              text-shadow: 0 2px 8px #0001;
            }
            .desc-gradient {
              background: linear-gradient(90deg, #4f8cff 30%, #a6e1fa 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-fill-color: transparent;
              font-size: 1.45rem;
              font-weight: 700;
              letter-spacing: -0.5px;
              display: inline-block;
              margin-bottom: 0.1em;
            }
            .desc-secondary {
              display: block;
              color: var(--desc-secondary, #23293a);
              opacity: 1;
              margin-top: 0.1em;
              text-shadow: 0 2px 8px #0003;
            }
            @media (max-width: 600px) {
              .app-description { font-size: 1.05rem; }
              .desc-gradient { font-size: 1.1rem; }
            }
          `}</style>
        </div>

        <div className="card fade-in">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2 text-primary" />
            Upload Log File
          </h2>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {files.length > 0 && (
          <>
            <div className="card fade-in">
              <FileSelector
                files={files}
                selectedFile={selectedFile}
                onChange={setSelectedFile}
              />
            </div>

            <div className="card fade-in">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiBarChart2 className="mr-2 text-primary" />
                Analytics Dashboard
              </h2>
              <AnalyticsDashboard
                analytics={analytics}
                isLoading={isAnalyticsLoading}
                onLevelClick={level => {
                  console.log('Drilldown clicked:', level);
                  handleFilterChange({ level });
                  setTimeout(() => {
                    logTableRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 0);
                }}
              />
            </div>

            <div className="card fade-in">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiList className="mr-2 text-primary" />
                Log Entries
              </h2>
              <LogFilters 
                onFilterChange={handleFilterChange} 
                minDate={filterRange.min} 
                maxDate={filterRange.max} 
              />
              <div className="mt-6" ref={logTableRef}>
                <LogTable logs={logs} isLoading={isLoading} />
              </div>
            </div>
          </>
        )}
        <footer>© {new Date().getFullYear()} Log Analyzer &mdash; Built with ❤️ by Soham</footer>
      </main>
    </div>
  );
}

export default App;