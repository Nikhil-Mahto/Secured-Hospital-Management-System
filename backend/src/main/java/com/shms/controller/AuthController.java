package com.shms.controller;

import java.util.HashSet;
import java.util.Set;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shms.payload.request.LoginRequest;
import com.shms.payload.request.SignupRequest;
import com.shms.payload.response.JwtResponse;
import com.shms.payload.response.MessageResponse;
import com.shms.service.AuthService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        MessageResponse response = authService.registerUser(signupRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody SignupRequest signupRequest) {
        Set<String> roles = new HashSet<>();
        roles.add("doctor");
        signupRequest.setRole(roles);
        
        MessageResponse response = authService.registerDoctor(signupRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody SignupRequest signupRequest) {
        Set<String> roles = new HashSet<>();
        roles.add("patient");
        signupRequest.setRole(roles);
        
        MessageResponse response = authService.registerPatient(signupRequest);
        return ResponseEntity.ok(response);
    }
} 