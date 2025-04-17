# Log Analyzer

A full-stack web application for uploading, parsing, storing, filtering, and visualizing server log files.

---

## Tech Stack

**Frontend**
- React (TypeScript)
- TailwindCSS
- Recharts (for analytics and charts)
- Axios (API requests)
- Material UI (MUI) & React Icons

**Backend**
- Python 3 (Flask, Flask-CORS)
- Pandas (log parsing & analytics)
- SQLite (default, can be adapted for MongoDB)
- SQLAlchemy (ORM)
- Docker

**DevOps**
- Docker & Docker Compose (multi-container orchestration)
- Nginx (serving built frontend)

---

## Features

- Upload `.log` files via drag-and-drop (frontend)
- Parse logs (timestamp, level, message, source file)
- Store logs in a database (default: SQLite, can be extended to MongoDB)
- Filter logs by level, date, and keywords
- Analytics dashboard with interactive charts (log levels, message frequency, etc.)
- Export filtered logs as CSV
- User authentication (basic, can be extended)
- Responsive, modern UI

---

## Project Structure

```
log_analyzer/
├── backend/
│   ├── app.py               # Flask backend API
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend Docker config
│   ├── uploads/             # Uploaded log files
│   └── logs.db              # SQLite database (default)
├── frontend/
│   ├── src/                 # React components and services
│   ├── public/              # Static assets
│   ├── Dockerfile           # Frontend Docker config
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # TailwindCSS config
├── docker-compose.yml       # Multi-container orchestration
├── sample*.log              # Example log files
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (for frontend)
- Python 3.x (for backend)
- Docker & Docker Compose (optional, for containerized deployment)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Using Docker Compose

```bash
docker-compose up --build
```

---

## Usage

1. Access the frontend at [http://localhost:3000](http://localhost:3000)
2. Drag & drop `.log` files to upload and analyze.
3. Filter logs by level, date, or search keywords.
4. View analytics and export filtered logs as CSV.

---

## Example Log Format

```
2025-04-02 09:12:45 [INFO] Starting backend server on port 5000
2025-04-02 09:12:47 [DEBUG] Loaded config from /etc/app/config.yaml
2025-04-02 09:12:49 [INFO] Connecting to MongoDB at localhost:27017
2025-04-02 09:12:50 [ERROR] Failed to connect to MongoDB: connection refused
```

---

## Contribution

Pull requests are welcome! Please open an issue first to discuss major changes.

---

## License

MIT
