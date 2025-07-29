import sqlite3

conn = sqlite3.connect('health.db')
c = conn.cursor()

c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    )
''')

c.execute('''
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

print("Database initialized successfully.")
