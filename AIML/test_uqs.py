# test_uqs.py
import sys, numpy as np, pandas as pd, joblib
from datetime import datetime

def add_date_features(X: pd.DataFrame, min_date: pd.Timestamp):
    X = X.copy()
    d = pd.to_datetime(X["date"])
    X["year"] = d.dt.year
    X["month"] = d.dt.month
    X["month_sin"] = np.sin(2 * np.pi * (X["month"] - 1) / 12.0)
    X["month_cos"] = np.cos(2 * np.pi * (X["month"] - 1) / 12.0)
    # This min_date value is baked into the transformer at training time via kw_args
    # so we don't use the runtime here except for signature compatibility.
    # The pipeline passes the same kw_args(min_date=...) it was trained with.
    # If your version instead computed t_idx from min_date:
    #   X["t_idx"] = ((d.dt.year - min_date.year) * 12 + (d.dt.month - min_date.month)).astype(int)
    # But most likely t_idx was computed the same way in training; include if needed:
    try:
        X["t_idx"] = ((d.dt.year - min_date.year) * 12 + (d.dt.month - min_date.month)).astype(int)
    except Exception:
        pass
    return X

# Make it visible as __main__.add_date_features for unpickling
sys.modules['__main__'].add_date_features = add_date_features

# Now load and predict
pipe = joblib.load(r"C:\Users\Lenevo\#Achintya\#Coding\Projects\smart_rental_system\uqs_model_pipeline.joblib")
X = pd.DataFrame([{"machine_id": 5, "company_id": 2, "date": "2025-07-01"}])
print(float(pipe.predict(X)[0]))
