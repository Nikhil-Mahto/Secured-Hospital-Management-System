package com.shms.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.shms.model.ERole;
import com.shms.model.Role;
import com.shms.model.User;
import com.shms.repository.RoleRepository;
import com.shms.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initRoles();
        initAdminUser();
    }
    
    private void initRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
            
            Role doctorRole = new Role();
            doctorRole.setName(ERole.ROLE_DOCTOR);
            roleRepository.save(doctorRole);
            
            Role patientRole = new Role();
            patientRole.setName(ERole.ROLE_PATIENT);
            roleRepository.save(patientRole);
            
            System.out.println("Initialized default roles");
        }
    }
    
    private void initAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setEmail("admin@shms.com");
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            
            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Admin Role not found."));
            roles.add(adminRole);
            
            adminUser.setRoles(roles);
            userRepository.save(adminUser);
            
            System.out.println("Initialized admin user");
        }
    }
} 