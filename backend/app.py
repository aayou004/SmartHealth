from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import csv
import io
import sqlite3

app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(stream)
        data = list(reader)

        # Try to parse numbers safely
        for row in data:
            for key in row:
                try:
                    row[key] = float(row[key])
                except ValueError:
                    pass  # leave as-is if not a number

        # Extract date, steps, and heart_rate columns if they exist
        steps = []
        heart_rates = []
        for row in data:
            if "steps" in row:
                try:
                    steps.append((row["date"], float(row["steps"])))
                except:
                    pass
            if "heart_rate" in row:
                try:
                    heart_rates.append((row["date"], float(row["heart_rate"])))
                except:
                    pass

        # Compute stats
        summary = {}
        if steps:
            step_values = [s[1] for s in steps]
            summary["average_steps"] = round(sum(step_values) / len(step_values), 2)
            summary["max_steps_day"] = max(steps, key=lambda x: x[1])[0]
        if heart_rates:
            hr_values = [hr[1] for hr in heart_rates]
            summary["average_heart_rate"] = round(sum(hr_values) / len(hr_values), 2)
            summary["max_heart_rate_day"] = max(heart_rates, key=lambda x: x[1])[0]

        return jsonify({"data": data, "summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def init_db():
    conn = sqlite3.connect("health.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Call the function on startup
init_db()

# Register endpoint
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
        return jsonify({'error': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)
    c.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', (username, hashed_password))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('health.db')
    c = conn.cursor()
    c.execute('SELECT password_hash FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    conn.close()

    if row and check_password_hash(row[0], password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401