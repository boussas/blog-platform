# Blog Platform

A full-stack blog platform built with Node.js, Express, MongoDB, and a React + TypeScript frontend.

---

## ✨ Features

- **Admin Portal:** Authenticated users can Create, Read, Update, and Delete articles.
- **Authentication:** Secure admin panel using **JWT** (JSON Web Tokens).
- **Search & Filtering:** Full-text search for articles and a dedicated page to browse articles by tag.
- **File Uploads:** Handles image uploads (featured image & in-editor) using **Multer**.
- **Responsive UI:** Built with **Tailwind CSS** for a clean, responsive, and dark-mode-ready interface.

---

## 🚀 Tech Stack

- **Backend:**
  - Node.js
  - Express
  - MongoDB (with Mongoose)
  - JSON Web Token (JWT)
  - Bcrypt.js
  - Multer
- **Frontend:**
  - React
  - TypeScript
  - Vite
  - React Router
  - Tailwind CSS
  - Quill.js

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (a running local or cloud instance)

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```
4.  Run the server:
    ```bash
    node server.js
    ```
    _(The server will run on `http://localhost:5000`)_

### 2. Frontend Setup

1.  In a **new terminal**, navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    _(The application will be available at `http://localhost:5173` or a similar port)_

### 3. (Optional) Seed Data

The backend includes a seed script. You can run it from the `backend` directory to populate the database with admin credentials:

```bash
cd backend
node scripts/seeds.js
```
