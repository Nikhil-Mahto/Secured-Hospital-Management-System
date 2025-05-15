package com.shms.service;

import com.shms.payload.request.LoginRequest;
import com.shms.payload.request.SignupRequest;
import com.shms.payload.response.JwtResponse;
import com.shms.payload.response.MessageResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
    
    MessageResponse registerUser(SignupRequest signupRequest);
    
    MessageResponse registerDoctor(SignupRequest signupRequest);
    
    MessageResponse registerPatient(SignupRequest signupRequest);
} 