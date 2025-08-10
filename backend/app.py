import os
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
from datetime import date
import io
import csv

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
PROFILE_PIC_FOLDER = os.path.join(UPLOAD_FOLDER, 'profile_pictures')
BACKGROUND_FOLDER = os.path.join(UPLOAD_FOLDER, 'backgrounds')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROFILE_PIC_FOLDER'] = PROFILE_PIC_FOLDER
app.config['BACKGROUND_FOLDER'] = BACKGROUND_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

os.makedirs(app.config['PROFILE_PIC_FOLDER'], exist_ok=True)
os.makedirs(app.config['BACKGROUND_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_db():
    conn = sqlite3.connect("health.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            name TEXT,
            profile_picture TEXT,
            gender TEXT,
            pronouns TEXT,
            dob TEXT,
            height REAL,
            weight REAL,
            blood_type TEXT,
            primary_goals TEXT,
            dietary_preferences TEXT,
            medical_conditions TEXT,
            allergies TEXT,
            workout_preferences TEXT,
            background_image TEXT
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
            calorie_intake INTEGER,
            protein REAL,
            carbs REAL,
            fat REAL,
            active_minutes INTEGER,
            workout_type TEXT,
            workout_intensity INTEGER,
            stress_level INTEGER,
            journal_entry TEXT,
            mindful_minutes INTEGER,
            heart_rate INTEGER,
            weight REAL,
            symptoms TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
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
    
    fields = [
        'steps', 'sleep_hours', 'water_glasses', 'mood', 'calorie_intake',
        'protein', 'carbs', 'fat', 'active_minutes', 'workout_type',
        'workout_intensity', 'stress_level', 'journal_entry',
        'mindful_minutes', 'heart_rate', 'weight', 'symptoms'
    ]
    
    log_data = {field: data.get(field) for field in fields}
    log_data['user_id'] = user_id
    log_data['date'] = log_date

    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401

    conn = sqlite3.connect('health.db')
    c = conn.cursor()

    try:
        keys = [key for key, value in log_data.items() if value is not None]
        values = [value for value in log_data.values() if value is not None]
        
        columns = ', '.join(keys)
        placeholders = ', '.join(['?'] * len(values))
        
        update_fields = [key for key in fields if key in log_data and log_data[key] is not None]
        update_setters = ', '.join([f'{key}=excluded.{key}' for key in update_fields])

        sql = f'''
            INSERT INTO health_data ({columns})
            VALUES ({placeholders})
            ON CONFLICT(user_id, date) DO UPDATE SET
            {update_setters}
        '''
        
        c.execute(sql, values)
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

@app.route('/api/profile/<int:user_id>', methods=['GET', 'POST', 'DELETE'])
def user_profile(user_id):
    conn = sqlite3.connect('health.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    if request.method == 'GET':
        try:
            c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = c.fetchone()
            if row:
                return jsonify(dict(row))
            return jsonify({"error": "User not found"}), 404
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

    if request.method == 'POST':
        data = request.form.to_dict()
        file = request.files.get('profile_picture_file')
        remove_picture = request.form.get('remove_profile_picture') == 'true'

        fields = [
            'name', 'gender', 'pronouns', 'dob', 'height', 'weight', 'blood_type',
            'primary_goals', 'dietary_preferences', 'medical_conditions',
            'allergies', 'workout_preferences'
        ]
        
        update_data = {field: data.get(field) for field in fields if field in data}

        c.execute("SELECT profile_picture FROM users WHERE id = ?", (user_id,))
        current_picture_row = c.fetchone()
        current_picture_path = current_picture_row[0] if current_picture_row else None

        if file and allowed_file(file.filename):
            if current_picture_path:
                full_path = os.path.join('backend', current_picture_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
            
            _, f_ext = os.path.splitext(file.filename)
            filename = secure_filename(f"{user_id}_{date.today().isoformat()}{f_ext}")
            filepath = os.path.join(app.config['PROFILE_PIC_FOLDER'], filename)
            file.save(filepath)
            update_data['profile_picture'] = os.path.join('uploads/profile_pictures', filename).replace("\\", "/")
        elif remove_picture:
            if current_picture_path:
                full_path = os.path.join('backend', current_picture_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
            update_data['profile_picture'] = None

        if not update_data:
            conn.close()
            return jsonify({"error": "No data provided to update"}), 400

        set_clause = ', '.join([f'{key} = ?' for key in update_data.keys()])
        values = list(update_data.values())
        values.append(user_id)

        try:
            c.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
            conn.commit()
            c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            updated_profile = c.fetchone()
            return jsonify({"message": "Profile updated successfully", "profile": dict(updated_profile)}), 200
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
            
    if request.method == 'DELETE':
        try:
            c.execute("SELECT profile_picture, background_image FROM users WHERE id = ?", (user_id,))
            user_data = c.fetchone()
            if not user_data:
                return jsonify({"error": "User not found"}), 404

            profile_picture_path = user_data['profile_picture']
            if profile_picture_path:
                full_path = os.path.join('backend', profile_picture_path)
                if os.path.exists(full_path):
                    os.remove(full_path)

            background_image_path = user_data['background_image']
            if background_image_path:
                full_path = os.path.join('backend', background_image_path)
                if os.path.exists(full_path):
                    os.remove(full_path)

            c.execute("DELETE FROM health_data WHERE user_id = ?", (user_id,))
            c.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()

            return jsonify({"message": f"User {user_id} and all associated data deleted successfully."}), 200
        except sqlite3.Error as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

@app.route('/uploads/<folder>/<path:filename>')
def uploaded_file(folder, filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], folder), filename)

@app.route('/api/background/<int:user_id>', methods=['POST'])
def background_settings(user_id):
    conn = sqlite3.connect('health.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    file = request.files.get('background_image_file')
    remove_background = request.form.get('remove_background_image') == 'true'

    c.execute("SELECT background_image FROM users WHERE id = ?", (user_id,))
    current_background_row = c.fetchone()
    current_background_path = current_background_row[0] if current_background_row else None

    update_data = {}

    if file and allowed_file(file.filename):
        if current_background_path:
            full_path = os.path.join('backend', current_background_path)
            if os.path.exists(full_path):
                os.remove(full_path)
        
        _, f_ext = os.path.splitext(file.filename)
        filename = secure_filename(f"bg_{user_id}_{date.today().isoformat()}{f_ext}")
        filepath = os.path.join(app.config['BACKGROUND_FOLDER'], filename)
        file.save(filepath)
        update_data['background_image'] = os.path.join('uploads/backgrounds', filename).replace("\\", "/")
    elif remove_background:
        if current_background_path:
            full_path = os.path.join('backend', current_background_path)
            if os.path.exists(full_path):
                os.remove(full_path)
        update_data['background_image'] = None
    
    if not update_data:
        conn.close()
        return jsonify({"error": "No data provided to update"}), 400

    try:
        c.execute("UPDATE users SET background_image = ? WHERE id = ?", (update_data['background_image'], user_id))
        conn.commit()
        c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        updated_profile = c.fetchone()
        return jsonify({"message": "Background updated successfully", "profile": dict(updated_profile)}), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/export/<int:user_id>', methods=['GET'])
def export_csv(user_id):
    conn = sqlite3.connect('health.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    try:
        c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_data = c.fetchone()

        if not user_data:
            return jsonify({"error": "No data to export"}), 404

        output = io.StringIO()
        writer = csv.writer(output)
        
        headers = [key for key in user_data.keys() if key not in ('id', 'password_hash', 'profile_picture', 'background_image')]
        writer.writerow(headers)
        
        writer.writerow([user_data[key] for key in headers])
            
        output.seek(0)
        
        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename=user_profile_{user_id}.csv"}
        )

    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
