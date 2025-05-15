# Secure Hospital Management System - Quick Start Guide

## Prerequisites

Before starting the application, make sure you have the following installed:

1. **Java Development Kit (JDK)** - Version 11 or higher
2. **Node.js** and **npm** - For the frontend
3. **Maven** - For building and running the backend
4. **PostgreSQL** - Database server

## Database Setup

The application is configured to connect to a PostgreSQL database with the following settings:
- Database name: `shms`
- Username: `postgres` 
- Password: `Nikhil2915`
- Port: `5432`

If you haven't created the database yet, you can do so with:

```sql
CREATE DATABASE shms;
```

## Starting the Application

We've provided two scripts to start both the backend and frontend with a single command:

### Option 1: Using PowerShell Script (Recommended)

1. Right-click on `start-application.ps1`
2. Select "Run with PowerShell"

This script will:
- Check for required dependencies (Node.js, Maven)
- Update frontend API URLs to use the correct backend port
- Install frontend dependencies if needed
- Start the Spring Boot backend
- Start the React frontend
- Automatically clean up when you close the frontend

### Option 2: Using Batch File

1. Double-click on `start-application.bat`

This script provides similar functionality but with fewer features.

## Manual Startup

If you prefer to start the applications manually:

### Backend (Spring Boot)

```
cd backend
mvn spring-boot:run
```

The backend will start at http://localhost:8081

### Frontend (React)

```
cd frontend
npm install  # First time only
npm start
```

The frontend will start at http://localhost:3000

## Default Accounts

The system initializes with the following account:

- **Admin**
  - Username: `admin`
  - Password: `admin123`

## Troubleshooting

- **Port already in use**: If port 8081 or 3000 is already in use, the application may fail to start. You can change the ports in `backend/src/main/resources/application.properties` and frontend services.
- **Database connection issues**: Ensure PostgreSQL is running and the credentials in `application.properties` are correct.
- **Maven or Node.js not found**: Ensure they are properly installed and available in your system PATH. 