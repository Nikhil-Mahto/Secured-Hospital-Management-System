package com.shms.service;

import java.util.List;

import com.shms.payload.response.MessageResponse;
import com.shms.payload.response.PatientResponse;

public interface DoctorService {
    List<PatientResponse> getAssignedPatients(Long doctorId);
    
    List<PatientResponse> getAllPatients();
    
    MessageResponse assignPatient(Long doctorId, Long patientId);
    
    MessageResponse unassignPatient(Long doctorId, Long patientId);
} 