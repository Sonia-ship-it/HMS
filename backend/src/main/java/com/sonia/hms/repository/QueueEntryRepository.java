package com.sonia.hms.repository;

import com.sonia.hms.entity.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    List<QueueEntry> findByDoctorIdAndSkippedFalseOrderByPositionAsc(Long doctorId);

    Optional<QueueEntry> findByDoctorIdAndServingTrue(Long doctorId);

    Optional<QueueEntry> findByAppointmentId(Long appointmentId);

    int countByDoctorIdAndSkippedFalseAndServingFalse(Long doctorId);
}
