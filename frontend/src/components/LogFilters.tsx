import React from 'react';

interface LogFiltersProps {
  onFilterChange: (filters: {
    level?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }) => void;
  minDate?: string;
  maxDate?: string;
}

export const LogFilters: React.FC<LogFiltersProps> = ({ onFilterChange, minDate, maxDate }) => {
  const [filters, setFilters] = React.useState({
    level: '',
    start_date: '',
    end_date: '',
    search: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <>
      <style>{`
        .filter-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1.5px solid var(--border-main);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px #0002;
        }
        .filter-label {
          color: var(--text-label);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          display: block;
        }
        .filter-card, .filter-group, .filter-select, .filter-input {
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .filter-select {
          height: 48px;
          background: var(--input-bg);
          color: var(--input-text);
          border: 1.5px solid var(--input-border);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          padding: 0 2.5rem 0 1rem;
          box-shadow: 0 2px 8px #0002;
          outline: none;
          appearance: none;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .filter-input {
          width: 100%;
          height: 48px;
          background: var(--input-bg);
          color: var(--input-text);
          border: 1.5px solid var(--input-border);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          padding: 0 3rem 0 1rem;
          box-shadow: 0 2px 8px #0002;
          outline: none;
          appearance: none;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .filter-select:focus, .filter-input:focus {
          border-color: var(--input-focus);
          box-shadow: 0 0 0 2px #4f8cff88;
        }
        .filter-select-chevron {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          color: var(--input-border);
          pointer-events: none;
          z-index: 2;
        }
        .filter-group {
          position: relative;
          margin-bottom: 1rem;
        }
      `}</style>
      <div className="filter-card" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem'}}>
        <div className="filter-group">
          <label htmlFor="level" className="filter-label">
            Log Level
          </label>
          <select
            id="level"
            name="level"
            value={filters.level}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
            <option value="DEBUG">Debug</option>
          </select>
          <span className="filter-select-chevron">▼</span>
        </div>

        <div className="filter-group">
          <label htmlFor="start_date" className="filter-label">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            id="start_date"
            name="start_date"
            value={filters.start_date}
            onChange={handleChange}
            min={minDate && minDate.length >= 16 ? minDate : undefined}
            max={maxDate && maxDate.length >= 16 ? maxDate : undefined}
            className="filter-input"
            placeholder={!minDate ? 'No logs' : ''}
            disabled={!minDate || !maxDate}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end_date" className="filter-label">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            id="end_date"
            name="end_date"
            value={filters.end_date}
            onChange={handleChange}
            min={minDate && minDate.length >= 16 ? minDate : undefined}
            max={maxDate && maxDate.length >= 16 ? maxDate : undefined}
            className="filter-input"
            disabled={!minDate || !maxDate}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="search" className="filter-label">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search in messages..."
            className="filter-input"
          />
        </div>
      </div>
    </>
  );
};
