package com.sonia.hms.repository;

import com.sonia.hms.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Page<Doctor> findByNameContainingIgnoreCaseOrSpecializationContainingIgnoreCase(
            String name, String specialization, Pageable pageable);
    long countByActiveTrue();
}
