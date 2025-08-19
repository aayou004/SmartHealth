import sqlite3
import os

conn = sqlite3.connect('health.db')
c = conn.cursor()

c.execute('DROP TABLE IF EXISTS users')

c.execute('''
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
''')

c.execute('DROP TABLE IF EXISTS health_data')
c.execute('''
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

c.execute('DROP TABLE IF EXISTS chat_sessions')
c.execute('''
    CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
''')

c.execute('DROP TABLE IF EXISTS chat_messages')
c.execute('''
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
    )
''')

conn.commit()
conn.close()

if not os.path.exists('uploads/profile_pictures'):
    os.makedirs('uploads/profile_pictures')

if not os.path.exists('uploads/backgrounds'):
    os.makedirs('uploads/backgrounds')

print("Database initialized and upload directories created successfully.")
