package com.sonia.hms.repository;

import com.sonia.hms.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    Page<MedicalRecord> findByPatientId(Long patientId, Pageable pageable);
}
