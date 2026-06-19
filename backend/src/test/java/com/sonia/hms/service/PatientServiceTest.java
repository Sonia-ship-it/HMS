package com.sonia.hms.service;

import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.dto.PatientDto;
import com.sonia.hms.entity.Patient;
import com.sonia.hms.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PatientService
 * Tests pagination, filtering, and business logic
 */
@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testPatient = new Patient();
        testPatient.setId(1L);
        testPatient.setName("John Doe");
        testPatient.setPhone("555-1234");          // was setPhoneNumber — field is phone
        testPatient.setNoShowRiskScore(0);
    }

    @Test
    void testListPatients_WithNameFilter_ReturnsFilteredResults() {
        // Arrange
        Page<Patient> page = new PageImpl<>(List.of(testPatient));
        when(patientRepository.findByNameContainingIgnoreCase(anyString(), any(Pageable.class)))
                .thenReturn(page);

        // Act — real method is list(), not listPatients()
        PageResponse<PatientDto> result = patientService.list(0, 10, "name", "asc", "John", null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getName());
        verify(patientRepository, times(1))
                .findByNameContainingIgnoreCase(eq("John"), any(Pageable.class));
    }

    @Test
    void testListPatients_WithPhoneFilter_ReturnsFilteredResults() {
        // Arrange
        Page<Patient> page = new PageImpl<>(List.of(testPatient));
        when(patientRepository.findByPhoneContaining(anyString(), any(Pageable.class)))
                .thenReturn(page);

        // Act
        PageResponse<PatientDto> result = patientService.list(0, 10, "name", "asc", null, "555");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        // PatientDto exposes getPhone(), not getPhoneNumber()
        assertEquals("555-1234", result.getContent().get(0).getPhone());
        verify(patientRepository, times(1))
                .findByPhoneContaining(eq("555"), any(Pageable.class));
    }

    @Test
    void testListPatients_NoFilter_ReturnsAllPatients() {
        // Arrange
        Page<Patient> page = new PageImpl<>(List.of(testPatient));
        when(patientRepository.findAll(any(Pageable.class))).thenReturn(page);

        // Act
        PageResponse<PatientDto> result = patientService.list(0, 10, "name", "asc", null, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(patientRepository, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void testRecordNoShow_IncreasesRiskScore() {
        // Arrange
        when(patientRepository.findById(1L)).thenReturn(java.util.Optional.of(testPatient));
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);

        // Act
        patientService.recordNoShow(1L);

        // Assert
        assertEquals(10, testPatient.getNoShowRiskScore());
        verify(patientRepository, times(1)).save(testPatient);
    }
}
