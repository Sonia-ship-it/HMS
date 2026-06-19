package com.sonia.hms.service;

import com.sonia.hms.dto.AuthRequest;
import com.sonia.hms.dto.AuthResponse;
import com.sonia.hms.entity.*;
import com.sonia.hms.repository.PatientRepository;
import com.sonia.hms.repository.UserAccountRepository;
import com.sonia.hms.security.HospitalUserDetails;
import com.sonia.hms.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserAccountRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserAccountRepository userRepository,
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(AuthRequest request) {
        // Allow login with either username or email
        String identifier = request.getUsername();
        UserAccount user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));
        
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse registerPatient(Patient patient, String username, String password) {
        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("This identifier is already taken");
        }
        
        // Check if it's an email and if email already exists
        if (username.contains("@") && userRepository.findByEmail(username).isPresent()) {
            throw new IllegalArgumentException("This email is already registered");
        }
        
        patient.recalculateRiskScore();
        Patient saved = patientRepository.save(patient);
        
        UserAccount account = new UserAccount();
        account.setUsername(username);
        account.setPassword(passwordEncoder.encode(password));
        
        // If username is email, set email field
        if (username.contains("@")) {
            account.setEmail(username);
        } else {
            account.setEmail(patient.getEmail());
        }
        
        account.setFullName(patient.getName());
        account.setPhone(patient.getPhone());
        account.setRole(Role.PATIENT);
        account.setPatientProfile(saved);
        userRepository.save(account);
        return buildAuthResponse(account);
    }

    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        // Verify current password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, currentPassword));
        
        // Update password
        UserAccount user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Map<String, String> generatePasswordResetToken(String identifier) {
        // Find user by username or email
        UserAccount user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Generate a simple reset token (in production, use secure random token with expiration)
        Map<String, Object> claims = new HashMap<>();
        claims.put("reset", true);
        claims.put("userId", user.getId());
        
        String token = jwtService.generateToken(user.getUsername(), claims);
        
        Map<String, String> response = new HashMap<>();
        response.put("resetToken", token);
        response.put("email", user.getEmail() != null ? maskEmail(user.getEmail()) : "your registered email");
        response.put("message", "Password reset link generated successfully");
        
        return response;
    }
    
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];
        String masked = username.length() > 2 
            ? username.substring(0, 2) + "***" 
            : "***";
        return masked + "@" + domain;
    }

    @Transactional
    public void resetPassword(String identifier, String resetToken, String newPassword) {
        // Validate token
        String username;
        try {
            username = jwtService.extractUsername(resetToken);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        
        // Find user
        UserAccount user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Verify token belongs to this user
        if (!user.getUsername().equals(username)) {
            throw new IllegalArgumentException("Invalid reset token for this user");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse me(HospitalUserDetails details) {
        return buildAuthResponse(details.getUser());
    }

    private AuthResponse buildAuthResponse(UserAccount user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        String token = jwtService.generateToken(user.getUsername(), claims);
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName() != null ? user.getFullName() : user.getUsername());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        if (user.getPatientProfile() != null) {
            response.setPatientId(user.getPatientProfile().getId());
        }
        if (user.getDoctorProfile() != null) {
            response.setDoctorId(user.getDoctorProfile().getId());
        }
        return response;
    }
}
