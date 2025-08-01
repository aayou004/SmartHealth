# backend/generate_ml_model.py
import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Create a dummy dataset for training
# Features: steps, sleep_hours, calorie_intake, active_minutes
# Target: is_good_day (1 for good, 0 for not good)
data = {
    'steps': [10000, 12000, 5000, 8000, 11000, 4000, 9500, 6000, 10500, 7000],
    'sleep_hours': [8, 7.5, 6, 7, 8.5, 5.5, 7, 6.5, 8, 6],
    'calorie_intake': [2000, 2200, 3000, 2500, 1900, 3500, 2100, 2800, 2000, 2600],
    'active_minutes': [60, 90, 20, 45, 75, 15, 50, 30, 80, 25],
    'is_good_day': [1, 1, 0, 1, 1, 0, 1, 0, 1, 0] # 1 means 'Good Day', 0 means 'Not a Good Day'
}
df = pd.DataFrame(data)

X = df[['steps', 'sleep_hours', 'calorie_intake', 'active_minutes']]
y = df['is_good_day']

# Train a simple Logistic Regression model
model = LogisticRegression()
model.fit(X, y)

# Define the path to save the model
model_dir = 'ml_models'
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'good_day_model.joblib')

# Save the trained model
joblib.dump(model, model_path)

print(f"Dummy ML model saved to: {model_path}")
print("Please ensure 'scikit-learn' and 'pandas' are installed: pip install scikit-learn pandas")