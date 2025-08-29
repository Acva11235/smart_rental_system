from flask import Flask, request, Response
import sys
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

# ----------------------------
# Fix #1: define + register the function expected by the pickled pipeline
# ----------------------------
def add_date_features(X: pd.DataFrame, min_date: pd.Timestamp):
    X = X.copy()
    d = pd.to_datetime(X["date"])
    X["year"] = d.dt.year
    X["month"] = d.dt.month
    X["month_sin"] = np.sin(2 * np.pi * (X["month"] - 1) / 12.0)
    X["month_cos"] = np.cos(2 * np.pi * (X["month"] - 1) / 12.0)
    # This uses the 'min_date' kwarg baked into the pipeline at training time:
    X["t_idx"] = ((d.dt.year - min_date.year) * 12 + (d.dt.month - min_date.month)).astype(int)
    return X

# Make it visible as __main__.add_date_features for unpickling
sys.modules['__main__'].add_date_features = add_date_features

# ----------------------------
# Load model (default: current dir)
# ----------------------------
MODEL_PATH = Path("/Users/vishnuadithya/Documents/Projects/caterpillars/smart_rental_system/AIML/uqs_model_pipeline.joblib")
pipe = joblib.load(MODEL_PATH)

app = Flask(__name__)

@app.post("/predict_uqs")
def predict_uqs():
    try:
        data = request.get_json(force=True) or {}
        machine_id = int(data["machine_id"])
        company_id = int(data["company_id"])
        date = str(data["date"])  # YYYY-MM-DD

        X = pd.DataFrame([{
            "machine_id": machine_id,
            "company_id": company_id,
            "date": date
        }])

        uqs = float(pipe.predict(X)[0])

        # Return JUST the number
        return Response(str(round(uqs, 2)), mimetype="text/plain")

    except KeyError as e:
        return Response(f"Missing field: {e}", status=400, mimetype="text/plain")
    except Exception as e:
        return Response(f"error: {e}", status=400, mimetype="text/plain")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)