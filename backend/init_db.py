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
        workout_preferences TEXT
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
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, date)
    )
''')

conn.commit()
conn.close()

if not os.path.exists('uploads/profile_pictures'):
    os.makedirs('uploads/profile_pictures')

print("Database initialized and upload directory created successfully.")
