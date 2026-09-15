# System Architecture & Data Flow Diagram

This document presents the complete system architecture and end-to-end data flow for the **AI-Based Crop Recommendation System**.

## 📊 Current Implementation Block Diagram

![Current Implementation Block Diagram](file:///C:/Users/ESWAR/.gemini/antigravity-ide/brain/bee7a2c1-1165-4bdc-8f80-64461662dbff/current_system_block_diagram_1789398269724.png)

---

## 🏗️ High-Level System Architecture

```mermaid
graph TB
    subgraph Client ["Client Presentation Layer (React + Vite)"]
        UI["React SPA Dashboard"]
        AuthCtx["AuthContext (JWT Session)"]
        Form["Prediction Form & History"]
        ProfileModal["User Profile Modal"]
    end

    subgraph Backend ["Backend API & Application Layer (Node.js & Express)"]
        Server["Express HTTP Server (Port 5000)"]
        AuthMW["JWT Auth Middleware (protect)"]
        AuthCtrl["Auth Controller (/api/auth)"]
        PredCtrl["Prediction Controller (/api/predict)"]
        HistCtrl["History Controller (/api/history)"]
    end

    subgraph ML ["Machine Learning Service Layer (Python Flask)"]
        MLApp["Flask Service (Port 8000)"]
        RFModel["Random Forest Classifier (scikit-learn)"]
    end

    subgraph DB ["Database Persistence Layer (PostgreSQL)"]
        UsersTbl[("users Table")]
        HistTbl[("prediction_history Table")]
        SensorTbl[("sensor_readings Table (Future IoT)")]
    end

    subgraph IoT ["Optional Hardware Layer (Raspberry Pi Zero 2 W)"]
        PiZero["Raspberry Pi Zero 2 W"]
        Sensors["NPK, Temp, Humidity, pH Sensors"]
    end

    %% Interactions
    UI -->|HTTP Requests / Bearer Token| Server
    Server --> AuthMW
    AuthMW --> AuthCtrl
    AuthMW --> PredCtrl
    AuthMW --> HistCtrl

    AuthCtrl <-->|User Credentials & Hashes| UsersTbl
    HistCtrl <-->|Query & Store History| HistTbl

    PredCtrl -->|POST /predict Payload| MLApp
    MLApp --> RFModel
    RFModel -->|Predicted Crop Label| PredCtrl
    PredCtrl -->|Store Input & Result| HistTbl

    Sensors --> PiZero
    PiZero -.->|POST /api/sensors/data (Future)| Server
    Server -.-> SensorTbl
```

---

## 🔄 End-to-End Prediction Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant React as React Frontend
    participant Express as Express Backend API
    participant Middleware as Auth Middleware (JWT)
    participant Postgres as PostgreSQL DB
    participant ML as Python ML Service

    User->>React: Enters Soil & Env Values (N, P, K, Temp, Humidity, pH, Rainfall)
    React->>Express: POST /api/predict (Header: Bearer JWT_TOKEN)
    Express->>Middleware: Validate Bearer Token
    
    alt Token Invalid / Expired
        Middleware-->>React: 401 Unauthorized (Redirect to Login)
    else Token Valid
        Middleware->>Express: Attach req.user (User ID, Email)
        Express->>ML: POST http://localhost:8000/predict (JSON payload)
        ML->>ML: Run Random Forest Model Inference
        ML-->>Express: Return { "predicted_crop": "rice" }
        Express->>Postgres: INSERT INTO prediction_history (user_id, input_params, crop)
        Postgres-->>Express: Confirm Saved Row ID
        Express-->>React: 200 OK { "success": true, "predicted_crop": "rice" }
        React-->>User: Display Recommended Crop Result Card
    end
```

---

## 🔐 Authentication & Session Flow

```mermaid
graph LR
    A["User submits Login Form"] --> B["POST /api/auth/login"]
    B --> C{"Check Email & Compare bcrypt Hash in DB"}
    C -- Match --> D["Sign JWT Token (Secret + 7-Day Exp)"]
    C -- Mismatch --> E["Return 400 Invalid Credentials"]
    D --> F["Return Token to React Client"]
    F --> G["Store Token in localStorage ('crop_app_token')"]
    G --> H["Attach 'Authorization: Bearer <token>' to all Axios Requests"]
```

---

## 📦 Component Summary

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Lucide-React, Axios | Interactive Dashboard, Login/Register screen, User Profile Modal, Prediction UI |
| **Backend API** | Node.js, Express.js | API routing, JWT verification, PostgreSQL query management, proxying to ML service |
| **ML Engine** | Python, Flask, Scikit-learn | Loads trained Random Forest model and performs crop prediction inference |
| **Database** | PostgreSQL | Persistent relational storage for user accounts and historical crop predictions |
| **Hardware (Future)** | Raspberry Pi Zero 2 W | Reads physical soil & weather telemetry and posts data to Express server |
