# Secure Auth Portal (Experiment 7 Version) 🔒

This is an advanced Full-Stack mini-project designed for students to understand how modern, secure web applications handle authentication and data protection. It specifically covers the core topics of **Experiment 7: Scalable Read APIs with Caching & Optimization (Now focused on Secure APIs with JWT, RBAC & Encryption)**.

## 🌟 What is this project about?
This project is a **Secure Dashboard** application that demonstrates enterprise-level backend security patterns.
- **Frontend (FE):** Built with **React** (using Vite). It features a premium, responsive UI with secure routing. It manages Access and Refresh tokens (Token Lifecycle), handles login/logout flows, and dynamically renders UI elements based on the user's Role (RBAC).
- **Backend (BE):** Built with **Spring Boot** (Java) and an **H2 In-Memory Database**. The backend is secured using **Spring Security**. It implements stateless **JWT Authentication**, role-based method security (`@PreAuthorize`), and uses **AES Encryption** to safely store simulated third-party credentials.

---

## 🚀 How to Run this Project

You will need to run the Backend and the Frontend separately. Open two different terminal windows.

### 1️⃣ Starting the Backend (Spring Boot)
1. Open a terminal.
2. Navigate into the `backend` folder:
   ```bash
   cd backend
   ```
3. Set `JWT_SECRET` to a unique random value of at least 32 bytes and `AES_SECRET` to a unique random value of 16, 24, or 32 bytes in your environment. Do not commit these values.
4. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
5. The backend will start running on **http://localhost:8080**.
   - Note: You can view the raw database at **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:testdb`, Username: `sa`, Password: `<empty>`).
   - Note: The database is automatically seeded with two users for testing:
     - **Admin**: Username: `admin`, Password: `admin123`
     - **User**: Username: `user`, Password: `user123`

### 2️⃣ Starting the Frontend (React)
1. Open a *new* terminal window.
2. Navigate into the `frontend` folder:
   ```bash
   cd exp_7_code/frontend
   ```
3. Install the required Node dependencies (you only need to do this once):
   ```bash
   npm install
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to the URL shown in the terminal (usually **http://localhost:5173**).

---

## 📚 Topics Covered in this Code:
* **React (Frontend):** 
  * Advanced context/state management for user authentication.
  * Axios interceptors to automatically attach the `Authorization: Bearer <token>` header to outgoing requests.
  * Silent token refresh flows using long-lived refresh tokens.
  * Protected Routes that redirect unauthenticated users to the login page.
* **Spring Boot (Backend) [Experiment 7 Core]:**
  * **Spring Security:** A custom `SecurityFilterChain` to protect all API endpoints except `/api/auth/**`.
  * **JWT Generation & Validation:** Generating signed JWTs on login and parsing them via a custom `OncePerRequestFilter`.
  * **Role-Based Access Control (RBAC):** Using `@PreAuthorize` to restrict access (e.g., distinguishing between `ROLE_USER` and `ROLE_ADMIN`).
  * **AES Encryption:** A utility class that encrypts sensitive simulated data before it is saved to the H2 database, ensuring it is never stored in plaintext.

Enjoy coding securely! 🛡️
