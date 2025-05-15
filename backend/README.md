# Secure Hospital Management System - Backend

This is the backend service for the Secure Hospital Management System (SHMS), built with Spring Boot.

## Features

- RESTful API for hospital management
- AES-256 encryption for patient records
- JWT authentication for secure API access
- Role-based access control

## Prerequisites

- Java 11+
- Maven
- PostgreSQL database

## Getting Started

1. **Configure Database**

   Create a PostgreSQL database named `shms`:

   ```sql
   CREATE DATABASE shms;
   ```

   Update the database configuration in `src/main/resources/application.properties` if needed.

2. **Run the Application**

   ```bash
   mvn spring-boot:run
   ```

   The server will start at http://localhost:8080

## API Endpoints

| Method | Endpoint                 | Description                          | Access        |
|--------|--------------------------|------------------------------------- |---------------|
| POST   | /api/auth/login          | Authenticate user                    | Public        |
| POST   | /api/auth/register       | Register regular user                | Public        |
| POST   | /api/auth/register/doctor| Register as doctor                   | Public        |
| POST   | /api/auth/register/patient| Register as patient                 | Public        |
| POST   | /api/records/upload      | Upload encrypted medical record      | Patient/Doctor|
| GET    | /api/records/patient/{id}| Get patient records                  | Patient/Doctor|
| GET    | /api/records/doctor      | Get doctor's patient records         | Doctor        |
| POST   | /api/records/decrypt/{id}| Decrypt a medical record             | Patient/Doctor|

## Security Architecture

- Each patient is assigned a unique AES-256 key at registration
- Patient records are encrypted before storage using their key
- The AES key is encrypted with a password-derived key
- Only authorized doctors and the patient can decrypt records

## Development

To build the project:

```bash
mvn clean install
```

To run tests:

```bash
mvn test
``` 