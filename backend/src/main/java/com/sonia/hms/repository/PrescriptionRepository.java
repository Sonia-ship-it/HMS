package com.sonia.hms.repository;

import com.sonia.hms.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);
}
