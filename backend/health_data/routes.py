from flask import Blueprint, request, jsonify, g
import csv
import io
import sqlite3
import os

health_data_bp = Blueprint("health_data", __name__)

DATABASE = 'health.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row # This allows us to access rows as dictionaries
    return db

@health_data_bp.teardown_app_request
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Your original CSV upload route
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

# New backend endpoint to delete a user profile
@health_data_bp.route("/api/profile/<int:user_id>", methods=["DELETE"])
def delete_profile(user_id):
    db = get_db()
    cursor = db.cursor()

    try:
        # Check if the user exists
        cursor.execute("SELECT user_id FROM user WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()
        if user is None:
            return jsonify({"error": "User not found"}), 404

        # Delete associated health logs first (to avoid foreign key issues)
        cursor.execute("DELETE FROM health_log WHERE user_id = ?", (user_id,))

        # Delete the user's profile from the user table
        cursor.execute("DELETE FROM user WHERE user_id = ?", (user_id,))

        # Commit the changes to the database
        db.commit()

        # Assuming a profile picture might exist, you would add logic to delete it from disk here.
        # e.g., os.remove(path_to_profile_picture)
        
        return jsonify({"message": f"User {user_id} and all associated data deleted successfully."}), 200

    except sqlite3.Error as e:
        db.rollback() # Roll back changes on error
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# --- Placeholder routes for other app functions (required for frontend to work) ---

@health_data_bp.route("/api/profile/<int:user_id>", methods=["GET", "POST"])
def profile(user_id):
    # This is a placeholder for your existing profile logic
    return jsonify({"message": f"Profile route for user {user_id} accessed."})

@health_data_bp.route("/api/logs/<int:user_id>", methods=["GET"])
def get_logs(user_id):
    # This is a placeholder for your existing logs fetching logic
    return jsonify([]) # Return an empty list or actual data

@health_data_bp.route("/api/export/<int:user_id>", methods=["GET"])
def export_data(user_id):
    # This is a placeholder for your existing data export logic
    return jsonify({"message": f"Export route for user {user_id} accessed."})