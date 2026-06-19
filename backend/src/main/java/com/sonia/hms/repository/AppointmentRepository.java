package com.sonia.hms.repository;

import com.sonia.hms.entity.Appointment;
import com.sonia.hms.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByAppointmentDate(LocalDate date, Pageable pageable);

    Page<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date, Pageable pageable);

    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    long countByAppointmentDate(LocalDate date);

    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    long countActiveByDoctorAndDate(Long doctorId, LocalDate date);

    List<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);

    List<Appointment> findByAppointmentDateAndAppointmentTimeBeforeAndStatus(
            LocalDate date, java.time.LocalTime time, AppointmentStatus status);

    List<Appointment> findByAppointmentDateLessThanEqualAndStatus(
            LocalDate date, AppointmentStatus status);

    @Query("SELECT a.doctor.id, COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date GROUP BY a.doctor.id")
    List<Object[]> countAppointmentsPerDoctor(LocalDate date);

    @Query("SELECT a.appointmentDate, COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end GROUP BY a.appointmentDate ORDER BY a.appointmentDate")
    List<Object[]> countAppointmentsPerDay(LocalDate start, LocalDate end);

    // Native SQL Query - Database-specific performance optimization
    @Query(value = "SELECT d.name as doctor_name, d.specialization, COUNT(a.id) as appointment_count " +
                   "FROM appointment a " +
                   "JOIN doctor d ON a.doctor_id = d.id " +
                   "WHERE a.appointment_date = :date AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                   "GROUP BY d.id, d.name, d.specialization " +
                   "ORDER BY appointment_count DESC", 
           nativeQuery = true)
    List<Object[]> getDoctorWorkloadNative(LocalDate date);

    @Query(value = "SELECT EXTRACT(HOUR FROM a.appointment_time) as hour, COUNT(*) as count " +
                   "FROM appointment a " +
                   "WHERE a.appointment_date = :date " +
                   "GROUP BY EXTRACT(HOUR FROM a.appointment_time) " +
                   "ORDER BY hour", 
           nativeQuery = true)
    List<Object[]> getAppointmentsByHourNative(LocalDate date);
}
