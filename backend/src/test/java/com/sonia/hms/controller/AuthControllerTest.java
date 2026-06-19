package com.sonia.hms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sonia.hms.dto.AuthRequest;
import com.sonia.hms.dto.AuthResponse;
import com.sonia.hms.entity.Role;
import com.sonia.hms.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for AuthController
 * Tests REST API endpoints and authentication
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void testLogin_ValidCredentials_ReturnsToken() throws Exception {
        // Arrange — build AuthResponse using setters (no multi-arg constructor)
        AuthResponse response = new AuthResponse();
        response.setToken("test-token");
        response.setUsername("admin");
        response.setRole(Role.ADMIN);

        when(authService.login(any(AuthRequest.class))).thenReturn(response);

        AuthRequest request = new AuthRequest();
        request.setUsername("admin");
        request.setPassword("password123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void testLogin_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        // Arrange
        when(authService.login(any(AuthRequest.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        AuthRequest request = new AuthRequest();
        request.setUsername("invalid");
        request.setPassword("wrong");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }
}
