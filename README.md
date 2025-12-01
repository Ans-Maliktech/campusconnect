# CampusConnect - Student Resource Marketplace

<div align="center">
  <img src="./frontend/public/logocc.png" alt="CampusConnect Logo" width="150"/>
  <br>
  A full-stack **MERN** application for students to buy, sell, and exchange academic resources within their university campus.
  <br />
  <br />
</div>

## 🎯 About The Project

**CampusConnect** is a peer-to-peer marketplace designed specifically for university students to trade academic resources such as textbooks, notes, hostel supplies, and tutoring services. The platform provides a safe and convenient way for students to connect with each other, reducing costs and promoting resource sharing within the campus community.

### Why CampusConnect?

* **💰 Save Money:** Buy used textbooks and resources at lower prices.
* **♻️ Sustainability:** Promote reuse and reduce waste.
* **🤝 Community:** Connect with fellow students on campus.
* **🔒 Safety:** Verified student accounts and campus-only access.
* **📱 Easy to Use:** Clean, intuitive interface designed for students.

---

## ✨ Features

### 🔐 Authentication & Authorization
* Secure user **registration** and **login** with **JWT**.
* Password encryption using **bcrypt**.
* Role-based access control (Student/Admin).
* Protected routes and API endpoints.

### 🛒 Marketplace Functionality
* **Browse Listings:** View all available items with filtering by category.
* **Post Listings:** Create listings with title, description, price, images, and condition.
* **Edit/Delete:** Full CRUD operations for your own listings only.
* **Product Details:** Detailed view with seller information.
* **Contact Reveal:** Safe contact information sharing system (gated by login).
* **Save Listings:** Bookmark items for later viewing.

### 👤 User Dashboard
* View all your **posted listings**.
* Manage **saved/bookmarked items**.
* Edit **profile information**.
* Track listing performance.

### 🔍 Search & Filter
* Filter by category (Textbooks, Notes, Hostel Supplies, Tutoring Services).
* Filter by condition (New, Like New, Good, Fair).
* Search functionality (by title and description).

### 🔒 Security Features
* JWT token-based authentication.
* Password hashing with bcrypt.
* Authorization checks (users can only edit/delete their own listings).
* Input validation and sanitization.

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js** | UI library |
| | **React Router** | Client-side routing |
| | **Context API** | Global state management (Authentication) |
| | **Axios** | HTTP requests |
| | **Bootstrap 5 / React-Bootstrap** | UI framework and components |
| **Backend** | **Node.js / Express.js** | Runtime and web framework (API endpoints) |
| | **MongoDB** | NoSQL database |
| | **Mongoose** | ODM for MongoDB |
| | **JWT / bcryptjs** | Authentication tokens and password hashing |
| **Development** | **Nodemon** | Auto-restart server during development |
| | **dotenv / CORS** | Environment variables and cross-origin handling |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js (v14 or higher)**: [Download here](https://nodejs.org/en/download/)
* **MongoDB (v4.4 or higher)**: [Download here](https://www.mongodb.com/try/download/community) (Recommended to install MongoDB Compass GUI tool)
* **Git**: [Download here](https://git-scm.com/downloads)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd CampusConnect
    ```
2.  **Install Backend dependencies:**
    ```bash
    cd backend
    npm install
    ```
3.  **Install Frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

### Configuration

1.  **Create a `.env` file** in the root of the **`backend`** directory (`CampusConnect/backend/.env`).
2.  **Add your environment variables** (for local development):
    ```env
    # .env content
    PORT=5000
    NODE_ENV=development
    
    # Local MongoDB Connection
    MONGO_URI=mongodb://localhost:27017/campusconnect 
    
    # Security Key (MUST be a long, random string)
    JWT_SECRET=your_super_secret_key_change_this_in_production
    ```

---

## Usage

1.  **Start MongoDB Service:** Ensure your local MongoDB server is running (usually via Windows Services or `mongod` command).
2.  **Start the Backend API:** In the **`backend`** directory:
    ```bash
    npm start 
    # The server will run on http://localhost:5000
    ```
3.  **Start the Frontend Client:** In a new terminal, navigate to the **`frontend`** directory:
    ```bash
    npm start
    # The client will run on http://localhost:3000
    ```
4.  Open your browser to `http://localhost:3000` to access the application.

---

## API Documentation

The API follows RESTful conventions and uses JWT for protected routes.

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/users/register` | `POST` | Register a new user | Public |
| `/api/users/login` | `POST` | Authenticate and receive JWT | Public |
| `/api/users/profile` | `GET/PUT` | View/Update user profile | Private |
| `/api/users/save/:id` | `PUT` | Toggle saving a listing | Private |
| `/api/listings` | `GET` | Get all listings (with filters) | Public |
| `/api/listings` | `POST` | Create a new listing | Private |
| `/api/listings/:id` | `GET/PUT/DELETE` | View/Update/Delete a specific listing | Public/Private |

---
