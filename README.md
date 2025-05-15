# Secure Hospital Management System (SHMS)

A full-stack hospital management system that prioritizes **data security** using **AES-256 encryption**. Patient records are securely encrypted, and only the patient and authorized medical staff (doctors) can decrypt and access them. The system uses **Java Spring Boot** for the backend and **React.js** for the frontend.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Features](#features)
- [Security Architecture](#security-architecture)
- [System Workflow](#system-workflow)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Tech Stack

| Layer        | Technology                              |
|--------------|------------------------------------------|
| Backend      | Java, Spring Boot, Spring Security, Spring Data JPA |
| Frontend     | React.js, Axios, React Router DOM        |
| Database     | PostgreSQL (or MySQL)                    |
| Security     | AES-256, JWT                             |
| Build Tools  | Maven (Java) & npm (Node.js)             |

---

## Folder Structure

SHMS/
├── backend/
│ ├── src/
│ │ ├── controller/
│ │ ├── service/
│ │ ├── model/
│ │ ├── repository/
│ │ └── security/
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ └── utils/

---

## Features

### Security
- AES-256 encryption for patient records
- JWT authentication
- Role-based access control

### User Roles
- **Admin**: Manage doctors and patients
- **Doctor**: Access and decrypt assigned patient records
- **Patient**: View and upload personal medical records

### Record Management
- Encrypted medical history storage
- Secure file upload and download

---

## Security Architecture

- **Each patient** is assigned a **unique AES-256 key** at registration.
- Patient records are encrypted using this AES key before being saved.
- The AES key is encrypted using a **password-derived key** (for the patient) and securely stored.
- Only authorized doctors (via secure key sharing or token) and the patient can decrypt the AES key and access medical records.
- **JWT tokens** are used for session security and role-based routing.

---

## System Workflow

1. **User Registration/Login**
   - Patient/Doctor registers or logs in using credentials.
   - Receives JWT token for secured API calls.

2. **Patient Registration**
   - AES key is generated and encrypted with patient's password-derived key.
   - Key is stored in the DB (as `encrypted_key`).

3. **Record Upload**
   - Patient selects file/text → AES-encrypted using their key → uploaded via `/upload`.

4. **Record Access**
   - Doctor retrieves assigned patient list.
   - Decrypts AES key (with provided access) and views the encrypted record.
   - Decryption happens client-side (or securely in backend if authorized).

5. **Record Display**
   - Decrypted record displayed securely in frontend.

---


### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run

Runs at: http://localhost:8080


 API Endpoints
Method	Endpoint	Description
POST	/auth/login	Authenticate & return JWT token
POST	/auth/register	Register as Patient or Doctor
POST	/records/upload	Upload AES-encrypted record
GET	/records/patient/{id}	Get encrypted records for patient
POST	/records/decrypt	Decrypt record using AES key




 UI Overview
 Patient Dashboard
Upload/View medical history

Decrypt records

Personal profile

 Doctor Dashboard
Assigned patients

Record viewer

Decryption access

 Admin Dashboard
Register Doctors/Patients

User management



 Backend Overview
 Technologies Used
Component	Tool/Framework
Core Language	Java
Framework	Spring Boot
Security	Spring Security + JWT
Persistence	Spring Data JPA + Hibernate
Database	PostgreSQL (or MySQL)
Encryption	Java Cryptography (JCA)
Build Tool	Maven

 Backend Structure

backend/
├── controller/         # Handles HTTP requests
├── service/            # Business logic
├── model/              # Entity classes (mapped to DB)
├── repository/         # Interfaces for DB access
├── security/           # JWT, encryption utilities, auth filters
├── config/             # Web and Security configuration
└── HospitalManagementApplication.java
 User Roles & Access
Patient

Register/Login

Upload encrypted records

View/decrypt personal records

Doctor

Login

View assigned patients

Decrypt patient records (if authorized)

Admin

Register doctors/patients

View/manage user info

 Encryption Workflow (AES-256)
 Key Generation & Storage
When a patient registers, generate a random 256-bit AES key.

Encrypt this AES key using a key derived from the patient’s password (PBKDF2 or similar).

Store the encrypted AES key in the database with the patient profile.

 Record Upload
Patient data or file is encrypted with the AES key.

Encrypted data is stored in the medical_records table.

 Decryption
To decrypt:

The user (patient or authorized doctor) provides credentials.

The system derives the decryption key → retrieves the encrypted AES key → decrypts the record.

