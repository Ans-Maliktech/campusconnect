# 🛒 Community Mart (Production Release v1.0)

### *A Product of Syntropy Tech*

**Community Mart** (formerly CampusConnect) is a hyper-local, secure marketplace designed for communities to buy, sell, and exchange goods and services safely. It prioritizes speed, security, and verified user interactions.

---

### 🚀 Key Features (Engineering Highlights)

* **🔒 Bank-Grade Security:**
    * Real-time Email Verification (OTP).
    * Rate Limiting & Helmet Headers (Anti-DDoS/XSS).
    * Secure Bcrypt Hashing (Asynchronous Salt Generation).
* **⚡ High Performance:**
    * **Crash-Proof Backend:** Optimized for 500+ concurrent users on minimal infrastructure.
    * Client-side Image Compression (5MB → 300KB).
    * Pagination & Advanced Search Filtering.
* **📸 Smart Media:**
    * Direct Gallery Uploads via Cloudinary.
    * Auto-cleaning Database (Listings expire in 10 days).
* **💬 Real-Time Communication:**
    * One-Click WhatsApp Integration.
    * Direct Call Features.

---

### 🧠 Performance Engineering

To ensure stability on cost-effective cloud infrastructure (Render Free Tier/MongoDB Atlas M0), the backend underwent rigorous load testing and optimization using **Grafana k6** and **Docker**.

**The Challenge:**
The initial system suffered from "Event Loop Blocking" due to synchronous operations, causing 60-second timeouts under a load of just 7 concurrent users.

**The Solution:**
* **Asynchronous Cryptography:** Refactored authentication middleware to use non-blocking `bcrypt` hashing, freeing up the Node.js main thread.
* **Connection Pooling:** Tuned MongoDB `maxPoolSize` to 50 to prevent connection exhaustion without exceeding Atlas limits.
* **Strategic Rate Limiting:** Implemented a split-middleware architecture to protect API routes while allowing high-frequency health checks for uptime monitoring.

**The Result:**
* **0% Failure Rate** at 500 Concurrent Virtual Users (VUs).
* **Latency dropped** from >60s (Timeout) to **15ms (Median)**.

---

### 🛠️ Tech Stack

* **Frontend:** React.js, Bootstrap 5, Axios, Framer Motion.
* **Backend:** Node.js, Express.js (MVC Architecture).
* **Database:** MongoDB Atlas (with TTL Indexes).
* **Services:** Cloudinary (Media), Nodemailer (SMTP), Vercel/Render (DevOps).
* **Testing:** Grafana k6, Docker.

---

### 🛠️ Local Development Setup

To run this project locally, you need two separate terminal instances (one for the Backend, one for the Frontend).

#### Prerequisites
* Node.js (v18+)
* MongoDB Atlas Account
* Cloudinary Account (for image hosting)

#### 1. Backend Setup
1.  Navigate to the `/backend` directory.
2.  Install dependencies: `npm install`
3.  Create a file named `.env` in the `/backend` directory.
4.  **Add the following variables to your `.env`:**
    ```env
    MONGO_URI=YOUR_ATLAS_CONNECTION_STRING
    JWT_SECRET=YOUR_SECRET_KEY_HERE
    EMAIL_USER=your_app_email@gmail.com
    EMAIL_PASS=your_16_char_app_password
    CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
    CLOUDINARY_API_KEY=YOUR_API_KEY
    CLOUDINARY_API_SECRET=YOUR_API_SECRET
    PORT=5000
    ```
5.  Start the server: `npm start` (or `nodemon server.js`)

#### 2. Frontend Setup
1.  Navigate to the `/frontend` directory.
2.  Install dependencies: `npm install`
3.  Ensure your `frontend/.env.development` (or root `.env`) has the local API URL:
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    ```
4.  Start the client: `npm start`

---

### 👨‍💻 Author & Copyright

**Ans Abdullah Malik**
*CEO & Founder, Syntropy Tech*

© 2025 Syntropy Tech. All Rights Reserved.