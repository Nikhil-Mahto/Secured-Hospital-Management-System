package com.shms.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shms.model.Doctor;
import com.shms.model.Patient;
import com.shms.model.User;
import com.shms.payload.response.MessageResponse;
import com.shms.payload.response.PatientResponse;
import com.shms.repository.DoctorRepository;
import com.shms.repository.PatientRepository;
import com.shms.repository.UserRepository;
import com.shms.service.DoctorService;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public List<PatientResponse> getAssignedPatients(Long doctorId) {
        User user = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));
        
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found for user"));
        
        return doctor.getPatients().stream()
                .map(patient -> mapPatientToResponse(patient, true))
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientResponse> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        List<PatientResponse> responses = new ArrayList<>();
        
        for (Patient patient : patients) {
            responses.add(mapPatientToResponse(patient, false));
        }
        
        return responses;
    }

    @Override
    public MessageResponse assignPatient(Long doctorId, Long patientId) {
        try {
            User doctorUser = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));
            
            Doctor doctor = doctorRepository.findByUser(doctorUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found for user"));
            
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
            
            // Check if patient is already assigned to this doctor
            if (doctor.getPatients().contains(patient)) {
                return new MessageResponse("Patient is already assigned to this doctor");
            }
            
            // Add patient to doctor's list
            doctor.getPatients().add(patient);
            doctorRepository.save(doctor);
            
            return new MessageResponse("Patient assigned successfully");
        } catch (Exception e) {
            return new MessageResponse("Error: " + e.getMessage());
        }
    }

    @Override
    public MessageResponse unassignPatient(Long doctorId, Long patientId) {
        try {
            User doctorUser = userRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));
            
            Doctor doctor = doctorRepository.findByUser(doctorUser)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found for user"));
            
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
            
            // Check if patient is assigned to this doctor
            if (!doctor.getPatients().contains(patient)) {
                return new MessageResponse("Patient is not assigned to this doctor");
            }
            
            // Remove patient from doctor's list
            doctor.getPatients().remove(patient);
            doctorRepository.save(doctor);
            
            return new MessageResponse("Patient unassigned successfully");
        } catch (Exception e) {
            return new MessageResponse("Error: " + e.getMessage());
        }
    }
    
    private PatientResponse mapPatientToResponse(Patient patient, boolean isAssigned) {
        User user = patient.getUser();
        
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFirstName() + " " + user.getLastName());
        response.setEmail(user.getEmail());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setContactNumber(patient.getContactNumber());
        response.setAddress(patient.getAddress());
        response.setAssigned(isAssigned);
        
        return response;
    }
}
