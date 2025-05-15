package com.shms.service;

import java.util.List;

import com.shms.payload.request.MedicalRecordRequest;
import com.shms.payload.response.MedicalRecordResponse;
import com.shms.payload.response.MessageResponse;

public interface MedicalRecordService {
    MessageResponse uploadMedicalRecord(MedicalRecordRequest recordRequest, Long userId);
    
    List<MedicalRecordResponse> getPatientRecords(Long patientId, Long userId);
    
    List<MedicalRecordResponse> getDoctorRecords(Long userId);
    
    String decryptRecord(Long recordId, String password, Long userId) throws Exception;
} 