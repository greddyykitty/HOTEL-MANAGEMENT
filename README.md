# Full-Stack Authentication System

A complete full-stack project demonstrating a robust authentication system using React (Vite) on the frontend, Spring Boot on the backend, and MySQL for the database.

## Features
- **Frontend**: Clean, responsive, and modern UI built with React.js and TailwindCSS.
- **Backend**: Secure REST APIs built with Java, Spring Boot, Spring Security, and Spring Data JPA.
- **Authentication**: Stateless authentication using JSON Web Tokens (JWT).
- **Security**: Passwords securely hashed using BCrypt. Role-based access control (`USER` and `ADMIN`).
- **Validation**: Comprehensive input validation ensuring robust client-side and server-side security.
- **Database**: Full relational schema using MySQL.
- **Infrastructure**: Ready for deployment. Fully Dockerized with `docker-compose`.

## Prerequisites
- Docker and Docker Compose (Easiest way to run the entire stack)

Alternatively, for local development:
- Node.js (v18+)
- Java 17
- Maven
- MySQL Server

## Running the Project with Docker (Recommended)
You can start the frontend, backend, and MySQL database automatically using Docker Compose.

1. Ensure Docker Desktop / Engine is running.
2. From the root of the project, run:
   ```bash
   docker compose up -d --build
   ```
3. The services will be available at:
   - **Frontend**: `http://localhost:5173`
   - **Backend API**: `http://localhost:8080` (Swagger UI usually at `/swagger-ui/index.html`)

To stop the services:
```bash
docker compose down
```

## Running Locally Manually

### 1. Database Setup
- Make sure MySQL is running locally on port `3306`.
- Create a database called `hackathon_db`.
- Update the connection settings (username/password) in `backend/src/main/resources/application.properties` to match your local setup.

### 2. Backend
- Navigate to the `backend` folder: `cd backend`
- Run the application: `mvn spring-boot:run`
- The backend API will start on `localhost:8080`.

### 3. Frontend
- Navigate to the `frontend` folder: `cd frontend`
- Install dependencies: `npm install`
- Start the development server: `npm run dev`
- Access the frontend in the browser at the URL it provides (usually `http://localhost:5173`).
"# HOTEL-MANAGEMENT" 
"# HOTEL-MANAGEMENT" 
