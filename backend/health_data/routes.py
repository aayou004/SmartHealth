from flask import Blueprint, request, jsonify
import csv
import io

health_data_bp = Blueprint("health_data", __name__)

@health_data_bp.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = csv.DictReader(stream)

    parsed_data = [row for row in csv_input]
    return jsonify(parsed_data)
