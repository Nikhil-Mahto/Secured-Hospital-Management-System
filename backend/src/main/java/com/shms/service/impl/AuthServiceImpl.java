package com.shms.service.impl;

import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shms.model.Doctor;
import com.shms.model.ERole;
import com.shms.model.Patient;
import com.shms.model.Role;
import com.shms.model.User;
import com.shms.payload.request.LoginRequest;
import com.shms.payload.request.SignupRequest;
import com.shms.payload.response.JwtResponse;
import com.shms.payload.response.MessageResponse;
import com.shms.repository.DoctorRepository;
import com.shms.repository.PatientRepository;
import com.shms.repository.RoleRepository;
import com.shms.repository.UserRepository;
import com.shms.security.encryption.EncryptionService;
import com.shms.security.jwt.JwtUtils;
import com.shms.security.services.UserDetailsImpl;
import com.shms.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;
    
    @Autowired
    EncryptionService encryptionService;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        String userType = determineUserType(roles);

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                userType);
    }

    private String determineUserType(List<String> roles) {
        if (roles.contains("ROLE_ADMIN")) {
            return "ADMIN";
        } else if (roles.contains("ROLE_DOCTOR")) {
            return "DOCTOR";
        } else if (roles.contains("ROLE_PATIENT")) {
            return "PATIENT";
        }
        return "USER";
    }

    @Override
    public MessageResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(encoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());

        Set<Role> roles = new HashSet<>();
        Set<String> strRoles = signupRequest.getRole();
        
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_PATIENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "doctor":
                        Role doctorRole = roleRepository.findByName(ERole.ROLE_DOCTOR)
                                .orElseThrow(() -> new RuntimeException("Error: Doctor Role is not found."));
                        roles.add(doctorRole);
                        break;
                    default:
                        Role patientRole = roleRepository.findByName(ERole.ROLE_PATIENT)
                                .orElseThrow(() -> new RuntimeException("Error: Patient Role is not found."));
                        roles.add(patientRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }

    @Override
    public MessageResponse registerDoctor(SignupRequest signupRequest) {
        // Register user first
        MessageResponse userResponse = registerUser(signupRequest);
        if (!userResponse.getMessage().equals("User registered successfully!")) {
            return userResponse;
        }

        // Get the created user
        User user = userRepository.findByUsername(signupRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Create doctor profile
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialty(signupRequest.getSpecialty());
        doctor.setLicenseNumber(signupRequest.getLicenseNumber());

        doctorRepository.save(doctor);

        return new MessageResponse("Doctor registered successfully!");
    }

    @Override
    public MessageResponse registerPatient(SignupRequest signupRequest) {
        // Register user first
        MessageResponse userResponse = registerUser(signupRequest);
        if (!userResponse.getMessage().equals("User registered successfully!")) {
            return userResponse;
        }

        // Get the created user
        User user = userRepository.findByUsername(signupRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        try {
            // Generate salt for password derivation
            String salt = encryptionService.generateSalt();
            
            // Generate AES key for the patient
            String aesKey = encryptionService.generateAESKey();
            String iv = encryptionService.generateIV();
            
            // Derive a key from the patient's password to encrypt their AES key
            String passwordDerivedKey = encryptionService.deriveKeyFromPassword(signupRequest.getPassword(), salt);
            
            // Encrypt the AES key with the password-derived key
            String encryptedAesKey = encryptionService.encryptAESKey(aesKey, passwordDerivedKey, iv);
            
            // Create patient profile
            Patient patient = new Patient();
            patient.setUser(user);
            patient.setDateOfBirth(signupRequest.getDateOfBirth());
            patient.setContactNumber(signupRequest.getContactNumber());
            patient.setAddress(signupRequest.getAddress());
            patient.setEncryptedAesKey(encryptedAesKey);
            patient.setInitializationVector(iv);
            patient.setPasswordSalt(salt);
            
            patientRepository.save(patient);
            
            return new MessageResponse("Patient registered successfully!");
        } catch (NoSuchAlgorithmException e) {
            return new MessageResponse("Error: Could not generate encryption key. Please try again.");
        } catch (Exception e) {
            return new MessageResponse("Error: Could not complete patient registration. Please try again.");
        }
    }
} 