from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sqlite3
import os
import json
from datetime import datetime
import pandas as pd

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'log'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('logs.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS log_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            level TEXT,
            message TEXT,
            source_file TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_log_line(line):
    try:
        # Assuming log format: "2023-04-17 10:30:45 [INFO] Log message"
        parts = line.strip().split(' ', 3)
        if len(parts) >= 4:
            date_str = f"{parts[0]} {parts[1]}"
            timestamp = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            level = parts[2].strip('[]')
            message = parts[3]
            return timestamp, level, message
        return None
    except Exception:
        return None

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Parse and store in SQLite
        conn = sqlite3.connect('logs.db')
        c = conn.cursor()
        
        entries_added = 0
        with open(filepath, 'r') as f:
            for line in f:
                parsed = parse_log_line(line)
                if parsed:
                    timestamp, level, message = parsed
                    c.execute('''
                        INSERT INTO log_entries (timestamp, level, message, source_file)
                        VALUES (?, ?, ?, ?)
                    ''', (timestamp, level, message, filename))
                    entries_added += 1
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': f'File uploaded successfully. {entries_added} entries added.',
            'filename': filename
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/files', methods=['GET'])
def get_files():
    conn = sqlite3.connect('logs.db')
    c = conn.cursor()
    c.execute('''
        SELECT DISTINCT source_file, MIN(created_at) as first_upload
        FROM log_entries
        GROUP BY source_file
        ORDER BY first_upload ASC
    ''')
    files = [{'filename': row[0]} for row in c.fetchall()]
    conn.close()
    return jsonify(files)

@app.route('/api/logs', methods=['GET'])
def get_logs():
    level = request.args.get('level')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')
    source_file = request.args.get('source_file')
    
    query = 'SELECT * FROM log_entries WHERE 1=1'
    params = []
    
    if source_file:
        query += ' AND source_file = ?'
        params.append(source_file)
    if level:
        query += ' AND level = ?'
        params.append(level)
    if start_date:
        query += ' AND timestamp >= ?'
        params.append(start_date)
    if end_date:
        query += ' AND timestamp <= ?'
        params.append(end_date)
    if search:
        query += ' AND message LIKE ?'
        params.append(f'%{search}%')
    
    conn = sqlite3.connect('logs.db')
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    
    return jsonify(df.to_dict('records'))

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    source_file = request.args.get('source_file')
    conn = sqlite3.connect('logs.db')
    c = conn.cursor()
    
    # Get log level distribution (as array for recharts)
    if source_file:
        c.execute('''
            SELECT level, COUNT(*) as count
            FROM log_entries
            WHERE source_file = ?
            GROUP BY level
        ''', (source_file,))
    else:
        c.execute('''
            SELECT level, COUNT(*) as count
            FROM log_entries
            GROUP BY level
        ''')
    level_distribution = [{'name': level, 'value': count} for level, count in c.fetchall()]
    
    # Get daily log count (as array for recharts)
    if source_file:
        c.execute('''
            SELECT date(timestamp) as date, COUNT(*) as count
            FROM log_entries
            WHERE source_file = ?
            GROUP BY date(timestamp)
            ORDER BY date(timestamp)
        ''', (source_file,))
    else:
        c.execute('''
            SELECT date(timestamp) as date, COUNT(*) as count
            FROM log_entries
            GROUP BY date(timestamp)
            ORDER BY date(timestamp)
        ''')
    daily_counts = [{'date': date, 'count': count} for date, count in c.fetchall()]
    
    # --- Top N frequent log messages ---
    N = 5
    if source_file:
        c.execute('''
            SELECT message, COUNT(*) as count
            FROM log_entries
            WHERE source_file = ?
            GROUP BY message
            ORDER BY count DESC
            LIMIT ?
        ''', (source_file, N))
    else:
        c.execute('''
            SELECT message, COUNT(*) as count
            FROM log_entries
            GROUP BY message
            ORDER BY count DESC
            LIMIT ?
        ''', (N,))
    top_messages = [{'message': message, 'count': count} for message, count in c.fetchall()]

    # --- Hourly counts by level for each date ---
    # Get all unique dates
    if source_file:
        c.execute('''SELECT DISTINCT date(timestamp) FROM log_entries WHERE source_file = ?''', (source_file,))
    else:
        c.execute('''SELECT DISTINCT date(timestamp) FROM log_entries''')
    dates = [row[0] for row in c.fetchall()]
    hourly_counts_by_level = {}
    for date in dates:
        if source_file:
            c.execute('''
                SELECT strftime('%H', timestamp) as hour, level, COUNT(*) as count
                FROM log_entries
                WHERE source_file = ? AND date(timestamp) = ?
                GROUP BY hour, level
            ''', (source_file, date))
        else:
            c.execute('''
                SELECT strftime('%H', timestamp) as hour, level, COUNT(*) as count
                FROM log_entries
                WHERE date(timestamp) = ?
                GROUP BY hour, level
            ''', (date,))
        rows = c.fetchall()
        # Build a list of 24 dicts (one for each hour)
        hours = [{ 'hour': h, } for h in range(24)]
        # Map: (hour, level) -> count
        for hour, level, count in rows:
            h = int(hour)
            # Always initialize all relevant levels
            for lvl in ['INFO', 'ERROR', 'DEBUG', 'WARNING']:
                if lvl not in hours[h]:
                    hours[h][lvl] = 0
            hours[h][level] = count
        # Fill missing levels with 0
        for h in hours:
            for lvl in ['INFO', 'ERROR', 'DEBUG', 'WARNING']:
                if lvl not in h:
                    h[lvl] = 0
        hourly_counts_by_level[date] = hours

    conn.close()
    
    return jsonify({
        'level_distribution': level_distribution,
        'daily_counts': daily_counts,
        'top_messages': top_messages,
        'hourly_counts_by_level': hourly_counts_by_level
    })

@app.route('/api/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    conn = sqlite3.connect('logs.db')
    c = conn.cursor()
    c.execute('DELETE FROM log_entries WHERE source_file = ?', (filename,))
    conn.commit()
    conn.close()
    # Remove the file from uploads folder
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    return jsonify({'message': f'File {filename} deleted.'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
