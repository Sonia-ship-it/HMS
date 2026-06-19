package com.sonia.hms.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security configuration tests
 * Tests authentication and authorization rules
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPublicEndpoint_NoAuth_ReturnsOk() throws Exception {
        // Public endpoints should be accessible without authentication
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void testProtectedEndpoint_NoAuth_ReturnsUnauthorized() throws Exception {
        // Protected endpoints should return 401 without auth
        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testAdminEndpoint_WithAdminRole_ReturnsOk() throws Exception {
        // Admin endpoints should be accessible with ADMIN role
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void testDoctorEndpoint_WithPatientRole_ReturnsForbidden() throws Exception {
        // Doctor endpoints should NOT be accessible with PATIENT role
        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void testDoctorEndpoint_WithDoctorRole_ReturnsOk() throws Exception {
        // Doctor endpoints should be accessible with DOCTOR role
        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void testPatientEndpoint_WithReceptionistRole_ReturnsOk() throws Exception {
        // Patient endpoints should be accessible with RECEPTIONIST role
        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isOk());
    }
}
