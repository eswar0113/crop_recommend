# Implementation Plan - AI-Based Crop Recommendation System

Build a full-stack **AI-Based Crop Recommendation System** adhering strictly to the specifications defined in [project_requirments.txt](file:///e:/CROP_RECOMMEND_FYP/project_requirments.txt). The architecture consists of a **React frontend**, **Node.js + Express backend**, **PostgreSQL database**, and a **Python Flask Machine Learning service**.

---

## User Review Required

> [!IMPORTANT]
> **PostgreSQL Configuration**: The project requires PostgreSQL running locally or via a cloud instance (e.g. Supabase / Neon / Local PostgreSQL). The backend will automatically create the `prediction_history` table if it does not exist when provided with a valid database connection string in `.env`.

> [!NOTE]
> **Hardware Integration Readiness**: All APIs (`POST /api/predict`) are designed with clean JSON input payloads so that an ESP32 micro-controller can seamlessly send sensor data in future iterations.

---

## Proposed Changes

```text
e:/CROP_RECOMMEND_FYP/
├── ml-service/             # Python Flask ML Service & Model Trainer
├── backend/                # Node.js + Express API & PostgreSQL layer
├── frontend/               # React Dashboard (Vite + Vanilla CSS)
├── README.md               # Complete Setup & Execution Guide
└── .gitignore              # Repository gitignore
```

---

### Component 1: Machine Learning Service (`ml-service/`)

#### [NEW] [ml-service/dataset/crop_recommendation.csv](file:///e:/CROP_RECOMMEND_FYP/ml-service/dataset/crop_recommendation.csv)
- Standard agricultural dataset containing 7 input parameters: `N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall` and target `label` (covering 22 distinct crops: Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee, etc.).

#### [NEW] [ml-service/requirements.txt](file:///e:/CROP_RECOMMEND_FYP/ml-service/requirements.txt)
- Dependencies: `flask`, `flask-cors`, `scikit-learn`, `pandas`, `numpy`, `joblib`.

#### [NEW] [ml-service/train_model.py](file:///e:/CROP_RECOMMEND_FYP/ml-service/train_model.py)
- Script to:
  1. Load `crop_recommendation.csv`.
  2. Perform dataset cleaning and missing/duplicate value checks.
  3. Extract features (`N`, `P`, `K`, `temperature`, `humidity`, `ph`, `rainfall`).
  4. Train a `RandomForestClassifier`.
  5. Print accuracy and classification report.
  6. Save trained model to `model/crop_model.pkl` using `joblib`.

#### [NEW] [ml-service/app.py](file:///e:/CROP_RECOMMEND_FYP/ml-service/app.py)
- Flask API running on port `8000`.
- Loads `model/crop_model.pkl` once at startup.
- Exposes `POST /predict` endpoint expecting JSON payload with the 7 parameters and returning `{ "predicted_crop": "<crop_name>" }`.

---

### Component 2: Backend API Service (`backend/`)

#### [NEW] [backend/package.json](file:///e:/CROP_RECOMMEND_FYP/backend/package.json)
- Express backend setup with `express`, `pg`, `axios`, `cors`, `dotenv`.

#### [NEW] [backend/.env.example](file:///e:/CROP_RECOMMEND_FYP/backend/.env.example) & `.env`
- Configuration keys: `PORT=5000`, `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crop_recommendation`, `ML_SERVICE_URL=http://localhost:8000`.

#### [NEW] [backend/db/index.js](file:///e:/CROP_RECOMMEND_FYP/backend/db/index.js)
- PostgreSQL pool instance using `pg`.
- Includes initialization function `initDb()` that creates `prediction_history` table automatically if missing.

#### [NEW] [backend/controllers/predictionController.js](file:///e:/CROP_RECOMMEND_FYP/backend/controllers/predictionController.js)
- Handles `POST /api/predict`:
  1. Validates numerical presence and bounds for N, P, K, temperature, humidity, ph, rainfall.
  2. Sends HTTP request to Python ML service (`POST http://localhost:8000/predict`).
  3. Inserts input values, predicted crop, and timestamp into PostgreSQL `prediction_history`.
  4. Returns prediction result and record details to React frontend.

#### [NEW] [backend/controllers/historyController.js](file:///e:/CROP_RECOMMEND_FYP/backend/controllers/historyController.js)
- Handles:
  - `GET /api/history`: Retrieves history ordered by `created_at DESC`.
  - `DELETE /api/history`: Deletes all prediction records.

#### [NEW] [backend/routes/predictionRoutes.js](file:///e:/CROP_RECOMMEND_FYP/backend/routes/predictionRoutes.js) & [backend/routes/historyRoutes.js](file:///e:/CROP_RECOMMEND_FYP/backend/routes/historyRoutes.js)
- Express router configuration mapping `/api/predict` and `/api/history`.

#### [NEW] [backend/server.js](file:///e:/CROP_RECOMMEND_FYP/backend/server.js)
- Main Express server entry point handling middleware, routes, database initialization, error handling, and server listen on port 5000.

---

### Component 3: React Web Dashboard (`frontend/`)

#### [NEW] [frontend/](file:///e:/CROP_RECOMMEND_FYP/frontend/)
- Initialize React project using Vite.

#### [NEW] [frontend/src/index.css](file:///e:/CROP_RECOMMEND_FYP/frontend/src/index.css)
- Premium, modern, responsive CSS design system:
  - Harmonious color palette (Emerald green accents, deep dark mode support, subtle card borders & glassmorphism).
  - Modern typography (Inter font).
  - Smooth micro-interactions, responsive grid layouts, card designs, badges, and button states.

#### [NEW] Components:
- `Header.jsx`: Professional app title, subtitle, and system status indicators.
- `PredictionForm.jsx`: Clean 7-parameter input fields with proper labels, units (kg/ha, °C, %, mm), ranges, placeholder examples, and loading submit button.
- `ResultCard.jsx`: Displays predicted crop with high visual emphasis, crop badges, and input parameters summary.
- `HistoryTable.jsx`: Responsive history table displaying past predictions, timestamps, parameters, and a "Clear History" confirmation modal.
- `Notification.jsx`: Error and alert banners for network failures or validation warnings.

---

### Component 4: Documentation & Infrastructure

#### [NEW] [README.md](file:///e:/CROP_RECOMMEND_FYP/README.md)
- Complete, beginner-friendly guide covering:
  - Project Overview & Architecture diagram.
  - Setup & installation for Python ML service, Node.js backend, and React frontend.
  - PostgreSQL database schema & instructions.
  - How to train the model and start all 3 services.
  - API reference with sample cURL / Axios requests.
  - ESP32 hardware integration readiness details.

#### [NEW] [.gitignore](file:///e:/CROP_RECOMMEND_FYP/.gitignore)
- Standard gitignore ignoring `node_modules`, `venv`, `*.pkl`, `.env`, `dist`, build output.

---

## Verification Plan

### Automated & System Verification
1. **Machine Learning Model Verification**:
   - Run `python train_model.py` inside `ml-service/`.
   - Verify `crop_model.pkl` is generated and evaluation metrics (accuracy > 95%) are printed.
2. **Flask ML API Verification**:
   - Start `python app.py` and test `POST http://localhost:8000/predict` with sample JSON payload.
3. **Node.js Express Backend Verification**:
   - Start Node backend and test `POST /api/predict`, `GET /api/history`, and `DELETE /api/history`.
4. **Frontend Verification**:
   - Run `npm run build` inside `frontend/` to confirm zero build errors or broken imports.

### Manual UI Verification
- Verify form validation with empty/out-of-range inputs.
- Submit a valid prediction and verify real-time prediction card display and dynamic update of the history table.
- Test "Clear History" button confirmation and empty history state.
