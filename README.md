# AI-Based Crop Recommendation System 🌾🤖

A full-stack agricultural decision support web application built with the **PERN stack** (PostgreSQL, Express, React, Node.js) and a separate **Python Flask Machine Learning service** utilizing a **Random Forest Classifier**.

---

## 📋 Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Key Features](#2-key-features)
- [3. Technology Stack](#3-technology-stack)
- [4. System Architecture & Data Flow](#4-system-architecture--data-flow)
- [5. Dataset & Parameters](#5-dataset--parameters)
- [6. Machine Learning Workflow](#6-machine-learning-workflow)
- [7. PostgreSQL Database Setup](#7-postgresql-database-setup)
- [8. Installation & Setup Guide](#8-installation--setup-guide)
  - [A. Python ML Service Setup](#a-python-ml-service-setup)
  - [B. Backend Setup](#b-backend-setup)
  - [C. Frontend Setup](#c-frontend-setup)
- [9. How to Start All 3 Services](#9-how-to-start-all-3-services)
- [10. API Endpoints & cURL Examples](#10-api-endpoints--curl-examples)
- [11. Environment Variables](#11-environment-variables)
- [12. Future Hardware Integration (ESP32)](#12-future-hardware-integration-esp32)

---

## 1. Project Overview
The **AI-Based Crop Recommendation System** enables farmers and agricultural researchers to enter soil nutrient concentrations ($N, P, K$) and environmental metrics ($\text{temperature}, \text{humidity}, \text{pH}, \text{rainfall}$) to receive instant, accurate crop recommendations powered by a trained **Random Forest Machine Learning model**.

Every prediction made through the dashboard is automatically saved with input parameters and timestamp to **PostgreSQL**, providing a complete prediction history.

> **Note**: PERN handles the web application interface and database storage, while the Python Flask service handles Machine Learning inference.

---

## 2. Key Features
- ⚡ **Real-Time AI Crop Prediction**: Evaluates 7 key soil & environmental features with >99% accuracy.
- 📊 **PostgreSQL Prediction History**: Records all predictions, timestamps, and parameters sorted newest first.
- 🗑️ **Clear History Action**: Safely purge history records directly from the React dashboard.
- 🎨 **Modern Responsive UI**: Dark glassmorphic dashboard built with React and custom CSS animations.
- 🔌 **Hardware Ready**: Clean API endpoints ready for future IoT ESP32 sensor integration.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite), Axios, Vanilla CSS | User interface, prediction form, history view |
| **Backend API** | Node.js, Express.js, `pg` | API routing, parameter validation, database layer |
| **Database** | PostgreSQL | Persistent prediction history storage |
| **ML Engine** | Python, Flask, Scikit-learn, Pandas, Joblib | Machine learning model training & REST API prediction |

---

## 4. System Architecture & Data Flow

```text
                  User
                   │
                   ▼
       React Dashboard (Frontend)
                   │
                (Axios)
                   │
                   ▼
         Node.js + Express API
         /                   \
        / (HTTP POST)         \ (pg SQL Queries)
       ▼                       ▼
Python ML Service         PostgreSQL
(Flask + Port 8000)   (Database: `crop_recommendation`)
       │
       ▼
Random Forest Model
(`crop_model.pkl`)
```

### Prediction Execution Flow:
1. User enters 7 parameters into the React dashboard and clicks **Predict Crop**.
2. React sends a `POST /api/predict` request to the Node.js Express backend.
3. Express validates parameter ranges and sends a `POST /predict` request to the Python Flask ML service.
4. Python Flask loads the pre-trained `crop_model.pkl` Random Forest model and predicts the crop.
5. Express receives the prediction result, inserts the record into PostgreSQL `prediction_history`, and returns the response to React.
6. React renders the recommended crop result card and updates the history table.

---

## 5. Dataset & Parameters

The model evaluates **exactly 7 input features**:

| Parameter | Description | Unit | Range / Example |
| :--- | :--- | :--- | :--- |
| `N` | Nitrogen content in soil | kg/ha | 0 - 140 |
| `P` | Phosphorus content in soil | kg/ha | 5 - 145 |
| `K` | Potassium content in soil | kg/ha | 5 - 205 |
| `temperature` | Ambient temperature | °C | 8 - 45 °C |
| `humidity` | Relative humidity | % | 14 - 99 % |
| `ph` | Soil pH level | pH (0-14) | 3.5 - 10.0 |
| `rainfall` | Annual/seasonal rainfall | mm | 20 - 300 mm |

**Target (`label`)**: 22 crops including Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee.

---

## 6. Machine Learning Workflow

The Machine Learning model is trained using Scikit-learn's `RandomForestClassifier`:
1. `train_model.py` loads `ml-service/dataset/crop_recommendation.csv`.
2. Checks for missing values, duplicates, and feature data types.
3. Splits dataset into 80% Training and 20% Testing sets.
4. Fits a Random Forest Classifier with 100 estimators.
5. Displays accuracy score and classification report.
6. Saves model output to `ml-service/model/crop_model.pkl`.

### To Train / Retrain the Model:
```bash
python ml-service/train_model.py
```

---

## 7. PostgreSQL Database Setup

1. Open PostgreSQL command line (`psql`) or pgAdmin:
```sql
CREATE DATABASE crop_recommendation;
```

2. Table schema (`prediction_history`):
```sql
CREATE TABLE prediction_history (
    id SERIAL PRIMARY KEY,
    N NUMERIC NOT NULL,
    P NUMERIC NOT NULL,
    K NUMERIC NOT NULL,
    temperature NUMERIC NOT NULL,
    humidity NUMERIC NOT NULL,
    ph NUMERIC NOT NULL,
    rainfall NUMERIC NOT NULL,
    predicted_crop VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
*(The backend automatically creates this table on startup if it does not already exist).*

---

## 8. Installation & Setup Guide

### A. Python ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
```

### B. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crop_recommendation
ML_SERVICE_URL=http://localhost:8000
```

### C. Frontend Setup
```bash
cd frontend
npm install
```

---

## 9. How to Start All 3 Services

Open 3 terminal windows:

#### Terminal 1: Python Flask ML Service
```bash
cd ml-service
python app.py
```
*(Runs on `http://localhost:8000`)*

#### Terminal 2: Node.js Express Backend
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:5000`)*

#### Terminal 3: React Frontend Dashboard
```bash
cd frontend
npm run dev
```
*(Open browser at `http://localhost:3000`)*

---

## 10. API Endpoints & cURL Examples

### Express Backend Endpoints (`http://localhost:5000`)

#### 1. Predict Crop: `POST /api/predict`
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 25.5,
    "humidity": 80,
    "ph": 6.5,
    "rainfall": 200
  }'
```
**Sample Response**:
```json
{
  "success": true,
  "predicted_crop": "rice",
  "record": {
    "id": 1,
    "n": "90",
    "p": "42",
    "k": "43",
    "temperature": "25.5",
    "humidity": "80",
    "ph": "6.5",
    "rainfall": "200",
    "predicted_crop": "rice",
    "created_at": "2026-09-14T13:20:00.000Z"
  }
}
```

#### 2. Get Prediction History: `GET /api/history`
```bash
curl -X GET http://localhost:5000/api/history
```

#### 3. Clear Prediction History: `DELETE /api/history`
```bash
curl -X DELETE http://localhost:5000/api/history
```

---

## 11. Environment Variables

| File | Parameter | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `backend/.env` | `PORT` | `5000` | Node Express server port |
| `backend/.env` | `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `backend/.env` | `ML_SERVICE_URL` | `http://localhost:8000` | Python Flask service URL |

---

## 12. Future Hardware Integration (ESP32)

The system API architecture is designed so an **ESP32 microcontroller** with NPK, DHT22 (temp/humidity), soil pH, and raindrop sensors can post directly to the Express backend:

```text
[NPK Sensor + DHT22 + pH + Rainfall] ──> ESP32 ──> (HTTP POST /api/predict) ──> Backend & ML Service
```

The React dashboard simulates these sensor inputs via manual user entry.
