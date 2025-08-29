# train_knn_save.py
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import joblib  # pip install joblib

# ---------- CONFIG ----------
CSV_PATH = r"/Users/vishnuadithya/Documents/Projects/caterpillars/smart_rental_system/AIML/company_cluster_features.csv"
# --- FIXED: Use the SAME absolute path as your Flask API ---
ARTIFACT_PATH = r"/Users/vishnuadithya/Documents/Projects/caterpillars/smart_rental_system/AIML/knn_recommender.joblib"

FEATURE_COLS = ["avg_util", "peak_util_p95", "fleet_now", "stress_index"]
ID_COL = "company_id"
EXTRA_COLS = [c for c in ["industry", "state"] if c]
# ----------------------------

def main():
    df = pd.read_csv(CSV_PATH)

    missing = [c for c in [ID_COL, *FEATURE_COLS] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in CSV: {missing}")

    df = df.dropna(subset=FEATURE_COLS).reset_index(drop=True)

    X = df[FEATURE_COLS].to_numpy(dtype=float)
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    nn = NearestNeighbors(metric="euclidean")
    nn.fit(Xs)

    print(f"Scaler was trained with {scaler.n_features_in_} features.")
    print(f"Feature columns list has {len(FEATURE_COLS)} features.")

    # --- FIX: Ensure no duplicate columns are saved in the artifact's DataFrame ---
    base_cols = [ID_COL, *FEATURE_COLS, *[c for c in EXTRA_COLS if c in df.columns]]
    asset_cols = [c for c in df.columns if c.startswith("avg_") or c.startswith("total_") or c.endswith("_count")]
    
    # Combine and get unique columns while preserving order
    all_cols_for_df = list(dict.fromkeys(base_cols + asset_cols))

    artifact = {
        "scaler": scaler,
        "nn": nn,
        "feature_cols": FEATURE_COLS,
        "id_col": ID_COL,
        "df": df[all_cols_for_df].copy()
    }
    
    joblib.dump(artifact, ARTIFACT_PATH, compress=3)
    print(f"Saved artifact to {Path(ARTIFACT_PATH).resolve()} with {len(df)} rows.")

if __name__ == "__main__":
    main()
