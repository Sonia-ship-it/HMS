package com.sonia.hms.repository;

import com.sonia.hms.entity.Appointment;
import com.sonia.hms.entity.AppointmentStatus;
import com.sonia.hms.entity.Doctor;
import com.sonia.hms.entity.Patient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AppointmentRepository
 * Tests JPQL queries, native queries, and pagination
 */
@DataJpaTest
class AppointmentRepositoryTest {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Doctor testDoctor;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        // Create test doctor — Doctor entity uses phone, not licenseNumber
        testDoctor = new Doctor();
        testDoctor.setName("Dr. Test");
        testDoctor.setSpecialization("Cardiology");
        testDoctor.setPhone("555-0001");          // was setLicenseNumber (field doesn't exist)
        testDoctor = entityManager.persist(testDoctor);

        // Create test patient — Patient entity uses phone, not phoneNumber
        testPatient = new Patient();
        testPatient.setName("Test Patient");
        testPatient.setPhone("555-0000");          // was setPhoneNumber (field is phone)
        testPatient = entityManager.persist(testPatient);

        // Create test appointments
        createTestAppointment(LocalDate.now(), LocalTime.of(9, 0), AppointmentStatus.SCHEDULED);
        createTestAppointment(LocalDate.now(), LocalTime.of(10, 0), AppointmentStatus.SCHEDULED);
        createTestAppointment(LocalDate.now(), LocalTime.of(11, 0), AppointmentStatus.CANCELLED);

        entityManager.flush();
    }

    private void createTestAppointment(LocalDate date, LocalTime time, AppointmentStatus status) {
        Appointment appointment = new Appointment();
        appointment.setDoctor(testDoctor);
        appointment.setPatient(testPatient);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setStatus(status);
        appointment.setNotes("Test");              // was setReason (field is notes)
        entityManager.persist(appointment);
    }

    @Test
    void testCountActiveByDoctorAndDate_ExcludesCancelled() {
        // Act - Test JPQL query
        long count = appointmentRepository.countActiveByDoctorAndDate(
                testDoctor.getId(), LocalDate.now());

        // Assert
        assertEquals(2, count); // Should exclude CANCELLED
    }

    @Test
    void testCountAppointmentsPerDoctor_ReturnsCorrectCount() {
        // Act - Test JPQL aggregation query
        List<Object[]> results = appointmentRepository.countAppointmentsPerDoctor(LocalDate.now());

        // Assert
        assertFalse(results.isEmpty());
        assertEquals(2, results.get(0).length); // [doctorId, count]
        assertEquals(3L, results.get(0)[1]); // Total count including cancelled
    }

    @Test
    void testCountAppointmentsPerDay_ReturnsTimeSeries() {
        // Arrange
        LocalDate start = LocalDate.now().minusDays(1);
        LocalDate end = LocalDate.now().plusDays(1);

        // Act - Test JPQL time series query
        List<Object[]> results = appointmentRepository.countAppointmentsPerDay(start, end);

        // Assert
        assertFalse(results.isEmpty());
        assertTrue(results.size() <= 3); // Max 3 days in range
    }

    @Test
    void testGetDoctorWorkloadNative_ReturnsWorkloadData() {
        // Act - Test Native SQL query
        List<Object[]> results = appointmentRepository.getDoctorWorkloadNative(LocalDate.now());

        // Assert
        assertFalse(results.isEmpty());
        assertEquals(3, results.get(0).length); // [name, specialization, count]
        assertEquals("Dr. Test", results.get(0)[0]);
        assertEquals("Cardiology", results.get(0)[1]);
        assertEquals(2L, results.get(0)[2]); // Active appointments only
    }

    @Test
    void testGetAppointmentsByHourNative_ReturnsHourlyDistribution() {
        // Act - Test Native SQL query with time extraction
        List<Object[]> results = appointmentRepository.getAppointmentsByHourNative(LocalDate.now());

        // Assert
        assertFalse(results.isEmpty());
        // Should have entries for hours 9, 10, 11
        assertTrue(results.size() >= 3);
    }

    @Test
    void testFindByStatus_ReturnsPaginatedResults() {
        // Act
        var results = appointmentRepository.findByStatus(
                AppointmentStatus.SCHEDULED,
                org.springframework.data.domain.PageRequest.of(0, 10));

        // Assert
        assertEquals(2, results.getTotalElements());
        assertEquals(1, results.getTotalPages());
    }
}
