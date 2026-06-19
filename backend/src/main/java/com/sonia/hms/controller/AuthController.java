package com.sonia.hms.controller;

import com.sonia.hms.dto.AuthRequest;
import com.sonia.hms.dto.AuthResponse;
import com.sonia.hms.entity.Gender;
import com.sonia.hms.entity.Patient;
import com.sonia.hms.security.HospitalUserDetails;
import com.sonia.hms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Current authenticated user")
    public AuthResponse me(@AuthenticationPrincipal HospitalUserDetails user) {
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }
        return authService.me(user);
    }

    @PostMapping("/register")
    @Operation(summary = "Register new patient account")
    public AuthResponse register(@RequestBody Map<String, Object> body) {
        Patient patient = new Patient();
        patient.setName((String) body.get("name"));
        
        String identifier = (String) body.get("username");
        if (identifier == null || identifier.isEmpty()) {
            identifier = (String) body.get("email");
        }
        
        // Determine if identifier is email or username
        boolean isEmail = identifier != null && identifier.contains("@");
        
        String username = isEmail ? identifier : identifier;
        String email = isEmail ? identifier : null;
        
        patient.setEmail(email);
        patient.setPhone((String) body.get("phone"));
        patient.setAddress((String) body.get("address"));
        
        if (body.get("dateOfBirth") != null) {
            patient.setDateOfBirth(LocalDate.parse(body.get("dateOfBirth").toString()));
        }
        if (body.get("gender") != null) {
            patient.setGender(Gender.valueOf(body.get("gender").toString().toUpperCase()));
        }
        
        return authService.registerPatient(
                patient,
                username,
                (String) body.get("password"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for authenticated user")
    public Map<String, String> changePassword(
            @AuthenticationPrincipal HospitalUserDetails user,
            @RequestBody Map<String, String> body) {
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }
        authService.changePassword(
                user.getUsername(),
                body.get("currentPassword"),
                body.get("newPassword"));
        return Map.of("message", "Password changed successfully");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset")
    public Map<String, String> forgotPassword(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        Map<String, String> response = authService.generatePasswordResetToken(identifier);
        return response;
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(
                body.get("identifier"),
                body.get("resetToken"),
                body.get("newPassword"));
        return Map.of("message", "Password reset successfully");
    }
}
