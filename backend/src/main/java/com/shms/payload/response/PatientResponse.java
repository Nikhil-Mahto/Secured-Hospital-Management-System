package com.shms.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String dateOfBirth;
    private String contactNumber;
    private String address;
    private boolean isAssigned;
} 