package com.shms.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.shms.model.Doctor;
import com.shms.model.ERole;
import com.shms.model.MedicalRecord;
import com.shms.model.Patient;
import com.shms.model.Role;
import com.shms.model.User;
import com.shms.payload.request.MedicalRecordRequest;
import com.shms.payload.response.MedicalRecordResponse;
import com.shms.payload.response.MessageResponse;
import com.shms.repository.DoctorRepository;
import com.shms.repository.MedicalRecordRepository;
import com.shms.repository.PatientRepository;
import com.shms.repository.UserRepository;
import com.shms.security.encryption.EncryptionService;
import com.shms.service.MedicalRecordService;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Override
    public MessageResponse uploadMedicalRecord(MedicalRecordRequest recordRequest, Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

            boolean isPatient = false;
            boolean isDoctor = false;

            for (Role role : user.getRoles()) {
                if (role.getName() == ERole.ROLE_PATIENT) {
                    isPatient = true;
                } else if (role.getName() == ERole.ROLE_DOCTOR) {
                    isDoctor = true;
                }
            }

            MedicalRecord record = new MedicalRecord();
            record.setRecordType(recordRequest.getRecordType());
            record.setEncryptedContent(recordRequest.getEncryptedContent());
            record.setFileName(recordRequest.getFileName());
            record.setContentType(recordRequest.getContentType());
            record.setCreatedAt(LocalDateTime.now());
            record.setUpdatedAt(LocalDateTime.now());

            if (isPatient) {
                Patient patient = patientRepository.findByUser(user)
                        .orElseThrow(() -> new RuntimeException("Patient profile not found for user"));
                record.setPatient(patient);
            } else if (isDoctor) {
                Doctor doctor = doctorRepository.findByUser(user)
                        .orElseThrow(() -> new RuntimeException("Doctor profile not found for user"));
                record.setDoctor(doctor);

                // If doctor is uploading for a patient
                if (recordRequest.getPatientId() != null) {
                    Patient patient = patientRepository.findById(recordRequest.getPatientId())
                            .orElseThrow(() -> new RuntimeException("Patient not found"));
                    record.setPatient(patient);
                } else {
                    return new MessageResponse("Error: Patient ID is required for doctor uploads");
                }
            } else {
                return new MessageResponse("Error: User is neither patient nor doctor");
            }

            medicalRecordRepository.save(record);
            return new MessageResponse("Medical record uploaded successfully");
        } catch (Exception e) {
            return new MessageResponse("Error: " + e.getMessage());
        }
    }

    @Override
    public List<MedicalRecordResponse> getPatientRecords(Long patientId, Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

            boolean isPatient = false;
            boolean isDoctor = false;
            boolean isAdmin = false;

            for (Role role : user.getRoles()) {
                if (role.getName() == ERole.ROLE_PATIENT) {
                    isPatient = true;
                } else if (role.getName() == ERole.ROLE_DOCTOR) {
                    isDoctor = true;
                } else if (role.getName() == ERole.ROLE_ADMIN) {
                    isAdmin = true;
                }
            }

            // Check if requesting user has permission to access these records
            if (isPatient) {
                Patient patient = patientRepository.findByUser(user)
                        .orElseThrow(() -> new RuntimeException("Patient profile not found for user"));
                if (!patient.getId().equals(patientId)) {
                    return new ArrayList<>();  // Return empty list if not authorized
                }
            } else if (!isDoctor && !isAdmin) {
                return new ArrayList<>();  // Return empty list if not authorized
            }

            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            List<MedicalRecord> records = medicalRecordRepository.findByPatient(patient);
            return records.stream().map(this::mapToResponse).collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    public List<MedicalRecordResponse> getDoctorRecords(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

            Doctor doctor = doctorRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found for user"));

            List<MedicalRecord> records = medicalRecordRepository.findByDoctor(doctor);
            return records.stream().map(this::mapToResponse).collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @Override
    public String decryptRecord(Long recordId, String password, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        // Get patient and check if user has access
        Patient patient = record.getPatient();
        boolean hasAccess = false;

        // If the user is the patient
        if (patient.getUser().getId().equals(userId)) {
            hasAccess = true;
        }

        // If the user is a doctor assigned to this patient
        if (!hasAccess) {
            Doctor doctor = doctorRepository.findByUser(user).orElse(null);
            if (doctor != null && doctor.getPatients().contains(patient)) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            throw new RuntimeException("Access denied: User does not have permission to decrypt this record");
        }

        // Get salt for password derivation
        String salt = patient.getPasswordSalt();
        
        // If salt is null (for backward compatibility), use the old method
        String passwordDerivedKey;
        if (salt != null && !salt.isEmpty()) {
            passwordDerivedKey = encryptionService.deriveKeyFromPassword(password, salt);
        } else {
            passwordDerivedKey = encryptionService.deriveKeyFromPassword(password);
        }

        // Decrypt the patient's AES key using the password-derived key
        String encryptedAesKey = patient.getEncryptedAesKey();
        String iv = patient.getInitializationVector();
        String aesKey = encryptionService.decryptAESKey(encryptedAesKey, passwordDerivedKey, iv);

        // Decrypt the record content using the AES key
        return encryptionService.decrypt(record.getEncryptedContent(), aesKey, iv);
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        MedicalRecordResponse response = new MedicalRecordResponse();
        response.setId(record.getId());
        
        if (record.getPatient() != null) {
            response.setPatientId(record.getPatient().getId());
            User patientUser = record.getPatient().getUser();
            response.setPatientName(patientUser.getFirstName() + " " + patientUser.getLastName());
        }
        
        response.setRecordType(record.getRecordType());
        response.setEncryptedContent(record.getEncryptedContent());
        response.setFileName(record.getFileName());
        response.setContentType(record.getContentType());
        response.setCreatedAt(record.getCreatedAt());
        response.setUpdatedAt(record.getUpdatedAt());
        
        if (record.getDoctor() != null) {
            response.setDoctorId(record.getDoctor().getId());
            User doctorUser = record.getDoctor().getUser();
            response.setDoctorName(doctorUser.getFirstName() + " " + doctorUser.getLastName());
        }
        
        return response;
    }
} 