package com.shms.payload.request;

import javax.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class MedicalRecordRequest {
    private Long patientId;
    
    @NotBlank
    private String recordType;
    
    @NotBlank
    private String encryptedContent;
    
    private String fileName;
    
    private String contentType;
} 