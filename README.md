# 🎓 CampusConnect (Production Release v1.0)

### *A Product of Syntropytech*

**CampusConnect** is a hyper-local, secure marketplace designed for university students to buy, sell, and exchange academic resources, electronics, and services within their campus.

---

### 🚀 Key Features (Engineering Highlights)

* **🔒 Bank-Grade Security:**
    * Real-time Email Verification (OTP).
    * Rate Limiting & Helmet Headers (Anti-DDoS/XSS).
    * Auto-Session Timeout (2 Minutes Inactivity).
* **⚡ High Performance:**
    * Client-side Image Compression (5MB → 300KB).
    * Pagination & Advanced Search Filtering.
* **📸 Smart Media:**
    * Direct Gallery Uploads via Cloudinary.
    * Auto-cleaning Database (Listings expire in 10 days).
* **💬 Real-Time Communication:**
    * One-Click WhatsApp Integration.
    * Direct Call Features.

---

### 🛠️ Tech Stack

* **Frontend:** React.js, Bootstrap 5, Axios, Framer Motion.
* **Backend:** Node.js, Express.js (MVC Architecture).
* **Database:** MongoDB Atlas (with TTL Indexes).
* **Services:** Cloudinary (Media), Nodemailer (SMTP), Vercel/Render (DevOps).

---
## 🛠️ Local Development Setup

To run this project locally, you need two separate terminal instances (one for the Backend, one for the Frontend).

### Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas Account
-   Cloudinary Account (for image hosting)

### 1. Backend Setup
1.  Navigate to the `/backend` directory.
2.  Install dependencies: `npm install`
3.  Create a file named `.env` in the `/backend` directory.
4.  **Add the following variables to your `.env`:**
    ```
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

### 2. Frontend Setup
1.  Navigate to the `/frontend` directory.
2.  Install dependencies: `npm install`
3.  Ensure your `frontend/.env` (or root `.env`) has the live API URL set for local testing:
    ```
    REACT_APP_API_URL=http://localhost:5000
    ```
4.  Start the client: `npm start`
### 👨‍💻 Author & Copyright

**Ans Abdullah Malik** *Lead Software Engineer @ Syntropytech*

© 2025 Syntropytech. All Rights Reserved.