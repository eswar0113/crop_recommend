import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def main():
    dataset_path = os.path.join(os.path.dirname(__file__), 'dataset', 'crop_recommendation.csv')
    model_dir = os.path.join(os.path.dirname(__file__), 'model')
    model_path = os.path.join(model_dir, 'crop_model.pkl')

    os.makedirs(model_dir, exist_ok=True)

    print(f"Loading dataset from: {dataset_path}")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)

    print("\n--- Dataset Info ---")
    print(f"Shape: {df.shape}")
    print(f"Missing Values:\n{df.isnull().sum()}")
    print(f"Duplicate Rows: {df.duplicated().sum()}")
    print(f"Data Types:\n{df.dtypes}\n")

    # Clean dataset if duplicates exist
    if df.duplicated().sum() > 0:
        df = df.drop_duplicates()
        print("Removed duplicate rows.")

    # Drop missing values if any
    df = df.dropna()

    # Features and target
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_cols]
    y = df['label']

    print(f"Features: {list(X.columns)}")
    print(f"Number of classes: {len(np.unique(y))}")

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    # Initialize & Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=15,
        n_jobs=-1
    )

    print("\nTraining Random Forest Classifier...")
    rf_model.fit(X_train, y_train)

    # Evaluate
    y_pred = rf_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n==========================================")
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print(f"==========================================\n")

    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save model
    joblib.dump(rf_model, model_path)
    print(f"Trained model saved successfully to: {model_path}")

if __name__ == '__main__':
    main()
