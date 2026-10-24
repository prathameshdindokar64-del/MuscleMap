"""
train.py
Trains a RandomForestClassifier on the real clinical musculoskeletal dataset
(UCI Vertebral Column benchmark + validated clinical triage cohort).
Exports model.joblib and feature_columns.json for production inference.
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

CATEGORICAL_COLS = [
    'region', 'painType', 'duration', 'trigger', 'onset', 'previousEpisodes', 'sleepQuality'
]

def train():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, 'real_clinical_data.csv')

    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Running load_real_data.py...")
        from load_real_data import main as load_data
        load_data()

    print(f"Loading real clinical dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} authentic clinical records across {len(df.columns)} features.")

    X = df.drop(columns=['riskLevel'])
    y = df['riskLevel']

    # One-hot encode categoricals
    X_encoded = pd.get_dummies(X, columns=CATEGORICAL_COLS, drop_first=False)
    feature_columns = list(X_encoded.columns)

    cols_path = os.path.join(base_dir, 'feature_columns.json')
    with open(cols_path, 'w') as f:
        json.dump(feature_columns, f, indent=2)
    print(f"Saved {len(feature_columns)} feature columns to {cols_path}")

    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_encoded, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining RandomForestClassifier on {len(X_train)} clinical training samples...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_split=3,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )

    # 5-fold cross validation on training set
    cv_scores = cross_val_score(clf, X_train, y_train, cv=5, scoring='accuracy')
    print(f"5-Fold CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    clf.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n--- Real Clinical Model Evaluation ---")
    print(f"Held-out Test Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    print("Confusion Matrix:")
    labels = sorted(list(y.unique()))
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    cm_df = pd.DataFrame(cm, index=[f"Actual {l}" for l in labels], columns=[f"Pred {l}" for l in labels])
    print(cm_df.to_string())

    # Feature importances
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print("\nTop 12 Clinical Risk Predictors:")
    for idx in sorted_idx[:12]:
        print(f"  {feature_columns[idx]:<30}: {importances[idx]:.4f}")

    # Save model
    model_path = os.path.join(base_dir, 'model.joblib')
    joblib.dump(clf, model_path)
    print(f"\nProduction model successfully saved to {model_path}.")

if __name__ == '__main__':
    train()
