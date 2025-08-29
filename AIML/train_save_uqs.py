# train_uqs_model.py
# Trains a model that takes (machine_id, company_id, date) -> UQS
# Input:  ./dummy_company_uqs_dispersion.csv
# Output: ./uqs_model_pipeline.joblib

from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import inspect
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH = Path("AIML/dummy_company_uqs_dispersion.csv")
OUT_PATH  = Path("uqs_model_pipeline.joblib")

def add_date_features(X: pd.DataFrame, min_date: pd.Timestamp) -> pd.DataFrame:
    X = X.copy()
    d = pd.to_datetime(X["date"])
    X["year"] = d.dt.year
    X["month"] = d.dt.month
    X["month_sin"] = np.sin(2 * np.pi * (X["month"] - 1) / 12.0)
    X["month_cos"] = np.cos(2 * np.pi * (X["month"] - 1) / 12.0)
    X["t_idx"] = ((d.dt.year - min_date.year) * 12 + (d.dt.month - min_date.month)).astype(int)
    return X

def make_ohe_dense():
    """Return OneHotEncoder configured to output DENSE arrays, compatible across sklearn versions."""
    params = inspect.signature(OneHotEncoder).parameters
    if "sparse_output" in params:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)  # sklearn ≥1.2
    else:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)         # sklearn ≤1.1

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Input CSV not found: {DATA_PATH.resolve()}")

    df = pd.read_csv(DATA_PATH)
    need = {"machine_id", "company_id", "date", "UQS"}
    missing = need - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    df["date"] = pd.to_datetime(df["date"])
    df["machine_id"] = df["machine_id"].astype(int)
    df["company_id"] = df["company_id"].astype(int)
    df["UQS"] = df["UQS"].astype(float)

    # Time-based split: last 15% dates as test
    cutoff = df["date"].quantile(0.85)
    train = df[df["date"] <= cutoff].copy()
    test  = df[df["date"]  > cutoff].copy()

    X_train = train[["machine_id", "company_id", "date"]]
    y_train = train["UQS"]
    X_test  = test[["machine_id", "company_id", "date"]]
    y_test  = test["UQS"]

    min_date = df["date"].min()
    date_fe = FunctionTransformer(add_date_features, validate=False, kw_args={"min_date": min_date})

    categorical = ["company_id", "machine_id", "month"]   # 'month' added by date_fe
    numerical   = ["year", "month_sin", "month_cos", "t_idx"]

    pre = ColumnTransformer(
        transformers=[
            ("cat", make_ohe_dense(), categorical),   # ensure dense for HGBR
            ("num", "passthrough", numerical),
        ],
        remainder="drop",
    )

    model = HistGradientBoostingRegressor(
        max_depth=6, learning_rate=0.08, random_state=42
    )

    pipe = Pipeline([
        ("date_features", date_fe),
        ("pre", pre),
        ("model", model),
    ])

    pipe.fit(X_train, y_train)

    pred = pipe.predict(X_test)
    mae = mean_absolute_error(y_test, pred)
    r2  = r2_score(y_test, pred)
    print(f"[sklearn {sklearn.__version__}]  MAE={mae:.3f}  R2={r2:.3f}  (test n={len(y_test)})")

    joblib.dump(pipe, OUT_PATH, compress=3)
    print(f"Saved model → {OUT_PATH.resolve()}")

if __name__ == "__main__":
    main()
