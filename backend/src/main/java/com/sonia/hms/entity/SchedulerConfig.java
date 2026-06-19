package com.sonia.hms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduler_config")
public class SchedulerConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String taskName;

    private String cronExpression;

    private Long fixedRateMs;

    private boolean enabled = true;

    private String description;

    @Column(name = "last_executed")
    private LocalDateTime lastExecuted;

    @Column(name = "next_execution")
    private LocalDateTime nextExecution;

    @Column(name = "execution_count")
    private Long executionCount = 0L;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SchedulerConfig() {
    }

    public SchedulerConfig(String taskName, String cronExpression, Long fixedRateMs, String description) {
        this.taskName = taskName;
        this.cronExpression = cronExpression;
        this.fixedRateMs = fixedRateMs;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }

    public Long getFixedRateMs() {
        return fixedRateMs;
    }

    public void setFixedRateMs(Long fixedRateMs) {
        this.fixedRateMs = fixedRateMs;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getLastExecuted() {
        return lastExecuted;
    }

    public void setLastExecuted(LocalDateTime lastExecuted) {
        this.lastExecuted = lastExecuted;
    }

    public LocalDateTime getNextExecution() {
        return nextExecution;
    }

    public void setNextExecution(LocalDateTime nextExecution) {
        this.nextExecution = nextExecution;
    }

    public Long getExecutionCount() {
        return executionCount;
    }

    public void setExecutionCount(Long executionCount) {
        this.executionCount = executionCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
