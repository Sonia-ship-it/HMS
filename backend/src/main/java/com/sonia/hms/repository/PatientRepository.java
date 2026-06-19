package com.sonia.hms.repository;

import com.sonia.hms.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Page<Patient> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Patient> findByPhoneContaining(String phone, Pageable pageable);
    long countByNoShowRiskScoreGreaterThan(int score);

    // Native query for high-risk patients analysis
    @Query(value = "SELECT p.id, p.name, p.phone_number, p.no_show_risk_score, " +
                   "COUNT(a.id) as total_appointments, " +
                   "SUM(CASE WHEN a.status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_shows " +
                   "FROM patient p " +
                   "LEFT JOIN appointment a ON p.id = a.patient_id " +
                   "WHERE p.no_show_risk_score > :minScore " +
                   "GROUP BY p.id, p.name, p.phone_number, p.no_show_risk_score " +
                   "ORDER BY p.no_show_risk_score DESC",
           nativeQuery = true)
    List<Object[]> getHighRiskPatientsNative(int minScore);
}
