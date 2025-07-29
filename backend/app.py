from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from datetime import date

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect("health.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            steps INTEGER,
            sleep_hours REAL,
            water_glasses INTEGER,
            mood INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, date)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    conn = sqlite3.connect('health.db')
    c = conn.cursor()

    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    if c.fetchone():
        conn.close()
        return jsonify({'error': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)
    c.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', (username, hashed_password))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('health.db')
    c = conn.cursor()
    c.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,))
    row = c.fetchone()

    if row and check_password_hash(row[1], password):
        user_id = row[0]
        conn.close()
        return jsonify({'message': 'Login successful', 'user_id': user_id}), 200
    else:
        conn.close()
        return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/api/log', methods=['POST'])
def log_health_data():
    data = request.json
    user_id = data.get('user_id')
    log_date = data.get('date', date.today().isoformat())
    steps = data.get('steps')
    sleep_hours = data.get('sleep_hours')
    water_glasses = data.get('water_glasses')
    mood = data.get('mood')

    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401

    conn = sqlite3.connect('health.db')
    c = conn.cursor()

    try:
        c.execute('''
            INSERT INTO health_data (user_id, date, steps, sleep_hours, water_glasses, mood)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET
            steps=excluded.steps,
            sleep_hours=excluded.sleep_hours,
            water_glasses=excluded.water_glasses,
            mood=excluded.mood
        ''', (user_id, log_date, steps, sleep_hours, water_glasses, mood))
        conn.commit()
        return jsonify({"message": "Data logged successfully"}), 201
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/logs/<int:user_id>', methods=['GET'])
def get_health_logs(user_id):
    conn = sqlite3.connect('health.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    try:
        c.execute("SELECT * FROM health_data WHERE user_id = ? ORDER BY date ASC", (user_id,))
        rows = c.fetchall()
        logs = [dict(row) for row in rows]
        return jsonify(logs)
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
