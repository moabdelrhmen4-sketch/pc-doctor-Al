
from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
from flask import send_from_directory

from backend.database import (
    initialize_database,
    save_diagnosis,
    get_diagnosis_history,
    delete_diagnosis_history
)

initialize_database()
app = Flask(__name__)
CORS(app)

DIAGNOSIS_RULES = {
    "power": {
        "title": "Computer Won't Turn On",
        "causes": ["Power supply issue", "Loose power cable"],
        "solutions": [
            "Check the power cable and wall outlet.",
            "Make sure the power supply switch is on.",
            "If the problem continues, contact a technician."
        ]
    },
    "slow": {
        "title": "Computer Running Slowly",
        "causes": ["Too many running applications", "Low available memory"],
        "solutions": [
            "Close applications you are not using.",
            "Restart the computer.",
            "Check available storage and memory."
        ]
    },
    "overheating": {
        "title": "Computer Overheating",
        "causes": ["Blocked air vents", "Dust buildup", "Heavy workload"],
        "solutions": [
            "Keep the air vents clear.",
            "Place the computer on a hard, flat surface.",
            "If overheating continues, ask a technician to inspect it."
        ]
    },
    "screen": {
        "title": "Display Problem",
        "causes": ["Loose display cable", "Monitor or display issue"],
        "solutions": [
            "Check that the monitor is powered on.",
            "Check the display cable connection.",
            "Try another monitor or cable if available."
        ]
    },
    "restarting": {
        "title": "Computer Restarts Unexpectedly",
        "causes": ["Overheating", "Power instability", "System error"],
        "solutions": [
            "Check whether the computer is overheating.",
            "Install pending operating system updates.",
            "If restarts continue, ask a technician to inspect the device."
        ]
    },
    "ram": {
        "title": "Possible Memory Problem",
        "causes": ["Insufficient available memory", "Memory hardware issue"],
        "solutions": [
            "Close unnecessary applications.",
            "Restart the computer and check whether the issue remains.",
            "For suspected hardware faults, contact a technician."
        ]
    }
}





@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    data = request.get_json(silent=True) or {}
    symptoms = data.get("symptoms", [])

    if not isinstance(symptoms, list):
        return jsonify({"error": "Symptoms must be a list."}), 400

    valid_symptoms = set(DIAGNOSIS_RULES.keys())
    selected = list(dict.fromkeys(
        symptom for symptom in symptoms
        if isinstance(symptom, str) and symptom in valid_symptoms
    ))

    if not selected:
        return jsonify({
            "results": [],
            "message": "Select at least one symptom to begin diagnosis."
        })

    results = []

    for symptom in selected:
        rule = DIAGNOSIS_RULES[symptom]
        results.append({
            "id": symptom,
            "title": rule["title"],
            "causes": rule["causes"],
            "solutions": rule["solutions"],
            "rule": f"IF symptom = {symptom} THEN diagnosis = {symptom}"
        })

    save_diagnosis(selected, results)

    return jsonify({
    "results": results,
    "count": len(results)
})



@app.route("/api/history", methods=["GET"])
def diagnosis_history():
    return jsonify({
        "history": get_diagnosis_history()
    })


@app.route("/api/history", methods=["DELETE"])
def clear_diagnosis_history():
    delete_diagnosis_history()
    return jsonify({
        "message": "Diagnosis history cleared successfully."
    })


FRONTEND_DIST = Path(__file__).resolve().parent.parent / "dist"

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and (FRONTEND_DIST / path).is_file():
        return send_from_directory(FRONTEND_DIST, path)
    return send_from_directory(FRONTEND_DIST, "index.html")
    
         
    
if __name__ == "__main__":
    app.run(debug=True, port=5000)
