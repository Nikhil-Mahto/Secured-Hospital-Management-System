package com.shms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shms.payload.response.MessageResponse;
import com.shms.payload.response.PatientResponse;
import com.shms.security.services.UserDetailsImpl;
import com.shms.service.DoctorService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    
    @Autowired
    private DoctorService doctorService;
    
    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PatientResponse>> getAssignedPatients() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<PatientResponse> patients = doctorService.getAssignedPatients(userDetails.getId());
        return ResponseEntity.ok(patients);
    }
    
    @GetMapping("/available-patients")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<PatientResponse>> getAvailablePatients() {
        List<PatientResponse> patients = doctorService.getAllPatients();
        return ResponseEntity.ok(patients);
    }
    
    @PostMapping("/assign/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> assignPatient(@PathVariable Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        MessageResponse response = doctorService.assignPatient(userDetails.getId(), patientId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/unassign/{patientId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> unassignPatient(@PathVariable Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        MessageResponse response = doctorService.unassignPatient(userDetails.getId(), patientId);
        return ResponseEntity.ok(response);
    }
} 