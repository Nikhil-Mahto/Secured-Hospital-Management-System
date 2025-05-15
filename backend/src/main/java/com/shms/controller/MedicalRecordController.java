package com.shms.controller;

import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shms.payload.request.MedicalRecordRequest;
import com.shms.payload.response.MedicalRecordResponse;
import com.shms.payload.response.MessageResponse;
import com.shms.security.services.UserDetailsImpl;
import com.shms.service.MedicalRecordService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/records")
public class MedicalRecordController {
    @Autowired
    private MedicalRecordService medicalRecordService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<?> uploadMedicalRecord(@Valid @RequestBody MedicalRecordRequest recordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        MessageResponse response = medicalRecordService.uploadMedicalRecord(recordRequest, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(@PathVariable Long patientId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<MedicalRecordResponse> records = medicalRecordService.getPatientRecords(patientId, userDetails.getId());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<MedicalRecordResponse>> getDoctorRecords() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<MedicalRecordResponse> records = medicalRecordService.getDoctorRecords(userDetails.getId());
        return ResponseEntity.ok(records);
    }

    @PostMapping("/decrypt/{recordId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<?> decryptRecord(@PathVariable Long recordId, @RequestBody Map<String, String> requestBody) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            String password = requestBody.get("password");
            if (password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Password is required"));
            }
            
            String decryptedContent = medicalRecordService.decryptRecord(recordId, password, userDetails.getId());
            return ResponseEntity.ok(Map.of("content", decryptedContent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
} 