import os
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
from datetime import date, timedelta
import io
import csv

# ML imports
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression # New import for Phase 2
import numpy as np # New import for Phase 2

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
PROFILE_PIC_FOLDER = os.path.join(UPLOAD_FOLDER, 'profile_pictures')
app.config['UPLOAD_FOLDER'] = PROFILE_PIC_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Define the path to the ML model for daily analysis
ML_MODEL_PATH = os.path.join('ml_models', 'good_day_model.joblib')
ml_model = None

# Load the ML model at application startup
try:
    if os.path.exists(ML_MODEL_PATH):
        ml_model = joblib.load(ML_MODEL_PATH)
        print("Daily analysis ML model loaded successfully.")
    else:
        print(f"Daily analysis ML model not found at {ML_MODEL_PATH}. Please run generate_ml_model.py first.")
except Exception as e:
    print(f"Error loading daily analysis ML model: {e}")
    ml_model = None

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
            workout_preferences TEXT
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
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
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
            c.execute("SELECT profile_picture FROM users WHERE id = ?", (user_id,))
            user_data = c.fetchone()
            if not user_data:
                return jsonify({"error": "User not found"}), 404

            # Delete profile picture file if it exists
            profile_picture_path = user_data['profile_picture']
            if profile_picture_path:
                full_path = os.path.join('backend', profile_picture_path)
                if os.path.exists(full_path):
                    os.remove(full_path)

            # Delete health data associated with the user
            c.execute("DELETE FROM health_data WHERE user_id = ?", (user_id,))

            # Delete the user itself
            c.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()

            return jsonify({"message": f"User {user_id} and all associated data deleted successfully."}), 200
        except sqlite3.Error as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()

# Daily analysis ML endpoint (Phase 1)
@app.route('/api/analyze_day', methods=['POST'])
def analyze_day():
    global ml_model # Access the globally loaded model
    if ml_model is None:
        return jsonify({'error': 'ML model not loaded. Please ensure generate_ml_model.py was run and the model file exists.'}), 503

    data = request.json
    
    # Extract features, providing default values if missing
    features_dict = {
        'steps': data.get('steps', 0),
        'sleep_hours': data.get('sleep_hours', 0),
        'calorie_intake': data.get('calorie_intake', 0),
        'active_minutes': data.get('active_minutes', 0)
    }
    
    # Prepare data for the model
    input_df = pd.DataFrame([features_dict], columns=['steps', 'sleep_hours', 'calorie_intake', 'active_minutes'])
    
    try:
        prediction = ml_model.predict(input_df)[0]
        
        feedback = []
        if features_dict['steps'] >= 10000:
            feedback.append("You hit your steps goal!")
        if features_dict['sleep_hours'] >= 7.5:
            feedback.append("You got a great night's sleep.")
        if features_dict['active_minutes'] >= 60:
            feedback.append("You were very active today.")
            
        final_feedback = " ".join(feedback)
        
        if prediction == 1:
            result = 'Good Day!'
            message = f"AI Analysis: {result} {final_feedback}" if final_feedback else f"AI Analysis: {result}"
        else:
            result = 'Keep Pushing!'
            if final_feedback:
                message = f"AI Analysis: {result} Consider focusing on improving {' and '.join(feedback)}."
            else:
                message = f"AI Analysis: {result} Consider focusing on your steps, sleep, or active minutes."
        
        return jsonify({'prediction': result, 'message': message}), 200
    except Exception as e:
        return jsonify({'error': f'Error making prediction: {str(e)}'}), 500

# New endpoint for long-term trend prediction (Phase 2)
@app.route('/api/predict_trend/<int:user_id>/<string:metric>', methods=['GET'])
def predict_trend(user_id, metric):
    conn = sqlite3.connect('health.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    try:
        print(f"Attempting to predict trend for user {user_id} and metric {metric}")
        if metric not in ['steps', 'sleep_hours', 'water_glasses', 'calorie_intake', 
                          'protein', 'carbs', 'fat', 'active_minutes', 
                          'workout_intensity', 'stress_level', 'mindful_minutes', 
                          'heart_rate', 'weight']:
            print(f"Invalid metric: {metric}")
            return jsonify({"error": "Invalid metric for trend prediction."}), 400

        c.execute(f"SELECT date, {metric} FROM health_data WHERE user_id = ? AND {metric} IS NOT NULL ORDER BY date ASC", (user_id,))
        rows = c.fetchall()
        
        print(f"Fetched {len(rows)} data points from the database.")
        
        if len(rows) < 2:
            return jsonify({"message": "Not enough data to predict trends. Please log at least 2 days of data for this metric."}), 200

        data_for_df = [dict(row) for row in rows]
        df = pd.DataFrame(data_for_df)
        
        print("DataFrame created.")
        
        if metric not in df.columns or not pd.api.types.is_numeric_dtype(df[metric]):
            print(f"Metric {metric} not found or is not a numeric type in DataFrame.")
            return jsonify({"error": f"Invalid data for metric: {metric}."}), 400

        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values(by='date')
        df['ordinal_date'] = df['date'].apply(lambda x: x.toordinal())
        print("Data prepared for model.")

        X = df[['ordinal_date']]
        y = df[metric]

        model = LinearRegression()
        model.fit(X, y)

        last_date = df['date'].max()
        future_dates = pd.to_datetime([last_date + timedelta(days=i) for i in range(1, 31)])
        future_dates_ordinal = future_dates.to_series().apply(lambda x: x.toordinal()).to_numpy().reshape(-1, 1)

        future_df = pd.DataFrame(future_dates_ordinal, columns=['ordinal_date'])
        predicted_values = model.predict(future_df)
        
        # --- FIX: Ensure no negative predictions ---
        predicted_values = np.maximum(0, predicted_values)
        
        print("Prediction made.")

        predicted_data = []
        for i, val in enumerate(predicted_values):
            predicted_data.append({
                'date': future_dates[i].isoformat().split('T')[0],
                f'predicted_{metric}': round(float(val), 2)
            })
        
        print("Prediction data formatted successfully.")
        return jsonify(predicted_data), 200

    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        print(f"An unexpected error occurred during trend prediction: {str(e)}")
        return jsonify({"error": f"An unexpected error occurred during trend prediction."}), 500
    finally:
        conn.close()

@app.route('/uploads/profile_pictures/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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
        
        headers = [key for key in user_data.keys() if key not in ('id', 'password_hash', 'profile_picture')]
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