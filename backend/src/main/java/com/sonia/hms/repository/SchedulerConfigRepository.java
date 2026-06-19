package com.sonia.hms.repository;

import com.sonia.hms.entity.SchedulerConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchedulerConfigRepository extends JpaRepository<SchedulerConfig, Long> {
    Optional<SchedulerConfig> findByTaskName(String taskName);
}
