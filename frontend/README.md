# Secure Hospital Management System - Frontend

This is the frontend application for the Secure Hospital Management System (SHMS), built with React.js and TypeScript.

## Features

- Patient and doctor dashboards
- Secure medical record management
- Client-side AES-256 encryption and decryption
- JWT authentication
- Role-based access control

## Prerequisites

- Node.js 14+
- npm 6+
- Backend service running

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**

   By default, the app connects to the backend at `http://localhost:8080`. 
   If your backend is running on a different URL, update the API_URL in the service files.

3. **Run the Application**

   ```bash
   npm start
   ```

   The app will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Architecture

### User Roles

- **Patient**: Can view and manage personal medical records
- **Doctor**: Can access assigned patient records
- **Admin**: Can manage system users and settings

### Security Features

- Client-side encryption using AES-256
- Password-derived key management
- Secure token-based authentication

## Key Components

- **Auth Service**: Handles JWT authentication and user management
- **Medical Record Service**: Manages encrypted medical records
- **Crypto Service**: Provides client-side encryption and decryption

## Project Structure

- `/src`
  - `/components`: Reusable UI components
  - `/pages`: Page components for different routes
  - `/services`: API service clients
  - `/utils`: Utility functions and helpers 