from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import io

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
