"""
R&L Fitness - 10-Slide Interactive Workout Web Application
Backend Server (Python & Flask)
Fully optimized for Hebrew RTL workout routines with Three.js 3D simulations.
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__, static_folder="static", template_folder="templates")

# In-memory storage for completed workout sessions
workout_sessions = []

# Exercise metadata catalog
EXERCISES_CATALOG = [
    {
        "id": "squats",
        "slide_index": 2,
        "name_he": "סקוואטים",
        "name_en": "Squats",
        "target_muscles_he": ["שריר הישבן", "ארבע ראשי"],
        "target_muscles_en": ["Glutes", "Quadriceps"],
        "instructions_he": (
            "עמדו בפיסוק ברוחב הכתפיים, כאשר כפות הרגליים פונות מעט החוצה. "
            "שמרו על שכמות אסופות וגב ישר וזקוף. רדו עם האגן לכיוון הרצפה תוך שמירה "
            "על גב ישר, עד לזווית של 90 מעלות בברכיים, ולאחר מכן דחפו חזרה מעלה."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/squat.jfif"
    },
    {
        "id": "pushups",
        "slide_index": 3,
        "name_he": "שכיבות סמיכה",
        "name_en": "Push-ups",
        "target_muscles_he": ["חזה", "כתף קדמית"],
        "target_muscles_en": ["Chest", "Anterior Deltoid"],
        "instructions_he": (
            "התמקמו על שש, רגליים ישרות לאחור וכפות רגליים צמודות. "
            "כפות הידיים על הרצפה במפתח מעט רחב מרוחב הכתפיים. כופפו את המרפקים כדי להוריד "
            "את בית החזה לאט לכיוון הרצפה, ודחפו חזרה למעלה בעוצמה ובמהירות. "
            "ודאו שאין שקיעה של האגן; התנועה מגיעה ממפרק הכתף."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/chest.jfif"
    },
    {
        "id": "bench-dips",
        "slide_index": 4,
        "name_he": "פשיטת מרפקים על ספה או שולחן",
        "name_en": "Bench Dips",
        "target_muscles_he": ["יד אחורית (תלת-ראשי)"],
        "target_muscles_en": ["Triceps Brachii"],
        "instructions_he": (
            "שבו על קצה הספה או השולחן, הניחו את כפות הידיים לצד האגן כשהאצבעות פונות קדימה. "
            "הזיזו את האגן מעט קדימה מחוץ לקצה, כשהרגליים ישרות קדימה על הרצפה. כופפו באיטיות "
            "את המרפקים כדי להוריד את הגוף, תוך שמירה על מרפקים קרובים לגוף, ואז דחפו חזרה בעוצמה באמצעות הזרועות."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/triceps.jfif"
    },
    {
        "id": "step-ups",
        "slide_index": 5,
        "name_he": "עליות מדרגה על כיסא",
        "name_en": "Step-ups on Chair",
        "target_muscles_he": ["ארבע ראשי", "אמסטרינג"],
        "target_muscles_en": ["Quadriceps", "Hamstrings"],
        "instructions_he": (
            "הציבו כיסא יציב לפניכם, הניחו רגל אחת במרכז מושב הכיסא. דחפו בעוצמה דרך כף הרגל שעל הכיסא "
            "עד ליישור מלא של הברך, כאשר הרגל השנייה מרחפת באוויר ללא תמיכה. הימנעו מרכינה מוגזמת "
            "קדימה כדי להגן על הברך. רדו לאט ובשליטה. החליפו רגליים כל 20 שניות."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/chair.jfif"
    },
    {
        "id": "lunges",
        "slide_index": 6,
        "name_he": "לאנצ'ים",
        "name_en": "Lunges",
        "target_muscles_he": ["ארבע ראשי", "המסטרינגס", "ישבן"],
        "target_muscles_en": ["Quadriceps", "Hamstrings", "Glutes"],
        "instructions_he": (
            "הציבו רגל אחת לאחור נשענת על כריות האצבעות, ברוחב פיסוק מתון מהרגל הקדמית. "
            "בית חזה מורם, גב ישר ויציב עם נטייה קלה קדימה. רדו עמוק ולאט ככל שניתן כאשר "
            "הברך האחורית שואפת לרצפה, ודחפו חזרה דרך כף הרגל הקדמית."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/lange.jfif"
    },
    {
        "id": "superman",
        "slide_index": 7,
        "name_he": "סופרמן",
        "name_en": "Superman",
        "target_muscles_he": ["גב"],
        "target_muscles_en": ["Back", "Erector Spinae"],
        "instructions_he": (
            "שכבו על הבטן עם ידיים ישרות קדימה ורגליים ישרות לאחור. הרימו בו-זמנית את הידיים, "
            "החזה וכפות הרגליים מעט מעל הרצפה תוך כיווץ שרירי הגב והישבן. שהו באוויר למשך "
            "2 שניות ורדו באיטיות חזרה."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/superman.jfif"
    },
    {
        "id": "crunches",
        "slide_index": 8,
        "name_he": "כפיפות בטן",
        "name_en": "Crunches",
        "target_muscles_he": ["שרירי בטן"],
        "target_muscles_en": ["Rectus Abdominis"],
        "instructions_he": (
            "שכבו על הגב עם ברכיים כפופות וכפות רגליים מונחות על הרצפה. הידיים תומכות בעורף, "
            "המבט ממוקד קדימה לתקרה. הרימו את בית החזה מהרצפה באמצעות כיווץ שרירי הבטן, "
            "תוך שמירה על המבט קדימה ללא משיכת הצוואר. החזיקו בכיווץ למשך שנייה אחת ורדו חזרה. "
            "עלו רק עד חצי הדרך, לא עד הברכיים."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/crunches.jpg"
    },
    {
        "id": "plank",
        "slide_index": 9,
        "name_he": "פלאנק",
        "name_en": "Plank",
        "target_muscles_he": ["שרירי בטן (שרירי ליבה)"],
        "target_muscles_en": ["Abdominals", "Core"],
        "instructions_he": (
            "רדו למנח פלאנק על האמות, כאשר המרפקים ממוקמים ישירות מתחת לכתפיים, "
            "והרגליים ישרות וצמודות. שמרו על אגן מוגבה בגובה החזה והחזיקו במנח "
            "סטטי בעזרת שרירי הליבה לאורך כל משך התרגיל."
        ),
        "sets": 3,
        "set_duration_seconds": 45,
        "rest_recommended_minutes": 1.5,
        "image_url": "/static/images/plank.jpg"
    }
]

@app.route("/")
def index():
    """Serves the main 10-slide interactive workout web application."""
    return render_template("index.html")

@app.route("/api/exercises", methods=["GET"])
def get_exercises():
    """Returns the catalog of 8 core exercises in JSON format."""
    return jsonify({
        "status": "success",
        "total_exercises": len(EXERCISES_CATALOG),
        "workout_total_time_estimate": "1 hour",
        "exercises": EXERCISES_CATALOG
    })

@app.route("/api/workout-summary", methods=["POST"])
def post_workout_summary():
    """Accepts and stores workout session metrics."""
    data = request.get_json(silent=True) or {}
    session_record = {
        "id": len(workout_sessions) + 1,
        "exercises_completed": data.get("exercisesCompleted", 8),
        "sets_completed": data.get("setsCompleted", 24),
        "duration_seconds": data.get("durationSeconds", 0),
        "mode": data.get("mode", "timed"),
        "calories": data.get("calories", 380),
        "completed_at": data.get("timestamp", datetime.utcnow().isoformat())
    }
    workout_sessions.append(session_record)
    return jsonify({
        "status": "success",
        "message": "אימון תועד בהצלחה במערכת!",
        "record": session_record
    })

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Returns aggregated stats from past workouts."""
    total_workouts = len(workout_sessions)
    total_calories = sum(w.get("calories", 0) for w in workout_sessions)
    return jsonify({
        "total_workouts_completed": total_workouts,
        "total_calories_burned": total_calories,
        "recent_sessions": workout_sessions[-5:]
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 60)
    print("  R&L Fitness - 10-Slide Interactive Workout Web Application")
    print(f"  שרת מקומי פעיל בכתובת: http://127.0.0.1:{port}")
    print("  לחצו Ctrl+C לעצירת השרת.")
    print("=" * 60)
    app.run(host="127.0.0.1", port=port, debug=True)
