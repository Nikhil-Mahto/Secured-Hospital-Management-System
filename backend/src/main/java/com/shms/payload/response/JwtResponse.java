package com.shms.payload.response;

import java.util.List;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private String userType; // ADMIN, DOCTOR, or PATIENT

    public JwtResponse(String token, Long id, String username, String email, List<String> roles, String userType) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.userType = userType;
    }
} 