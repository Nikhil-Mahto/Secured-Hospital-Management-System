package com.shms.payload.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MedicalRecordResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private String recordType;
    private String encryptedContent;
    private String fileName;
    private String contentType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long doctorId;
    private String doctorName;
} 