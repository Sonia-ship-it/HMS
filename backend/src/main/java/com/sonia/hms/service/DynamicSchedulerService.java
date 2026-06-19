package com.sonia.hms.service;

import com.sonia.hms.entity.SchedulerConfig;
import com.sonia.hms.repository.SchedulerConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
public class DynamicSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(DynamicSchedulerService.class);

    private final SchedulerConfigRepository schedulerConfigRepository;
    private final TaskScheduler taskScheduler;
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public DynamicSchedulerService(SchedulerConfigRepository schedulerConfigRepository, TaskScheduler taskScheduler) {
        this.schedulerConfigRepository = schedulerConfigRepository;
        this.taskScheduler = taskScheduler;
    }

    public void scheduleTask(String taskName, Runnable task) {
        SchedulerConfig config = schedulerConfigRepository.findByTaskName(taskName).orElse(null);
        
        if (config == null || !config.isEnabled()) {
            log.info("Task {} is not configured or disabled", taskName);
            return;
        }

        // Cancel existing task if running
        cancelTask(taskName);

        ScheduledFuture<?> scheduledFuture;
        
        if (config.getCronExpression() != null && !config.getCronExpression().isEmpty()) {
            // Schedule with cron expression
            scheduledFuture = taskScheduler.schedule(
                wrapTask(taskName, task),
                new CronTrigger(config.getCronExpression())
            );
            log.info("Scheduled task {} with cron: {}", taskName, config.getCronExpression());
        } else if (config.getFixedRateMs() != null && config.getFixedRateMs() > 0) {
            // Schedule with fixed rate
            scheduledFuture = taskScheduler.scheduleAtFixedRate(
                wrapTask(taskName, task),
                config.getFixedRateMs()
            );
            log.info("Scheduled task {} with fixed rate: {}ms", taskName, config.getFixedRateMs());
        } else {
            log.warn("Task {} has no valid schedule configuration", taskName);
            return;
        }

        scheduledTasks.put(taskName, scheduledFuture);
    }

    private Runnable wrapTask(String taskName, Runnable task) {
        return () -> {
            try {
                log.debug("Executing task: {}", taskName);
                task.run();
                updateExecutionStats(taskName);
            } catch (Exception e) {
                log.error("Error executing task {}: {}", taskName, e.getMessage(), e);
            }
        };
    }

    @Transactional
    public void updateExecutionStats(String taskName) {
        schedulerConfigRepository.findByTaskName(taskName).ifPresent(config -> {
            config.setLastExecuted(LocalDateTime.now());
            config.setExecutionCount(config.getExecutionCount() + 1);
            schedulerConfigRepository.save(config);
        });
    }

    public void cancelTask(String taskName) {
        ScheduledFuture<?> scheduledTask = scheduledTasks.get(taskName);
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
            scheduledTasks.remove(taskName);
            log.info("Cancelled task: {}", taskName);
        }
    }

    public void rescheduleTask(String taskName, Runnable task) {
        cancelTask(taskName);
        scheduleTask(taskName, task);
        log.info("Rescheduled task: {}", taskName);
    }

    @Transactional
    public SchedulerConfig updateSchedulerConfig(Long id, SchedulerConfig updatedConfig) {
        SchedulerConfig config = schedulerConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Scheduler config not found"));
        
        config.setCronExpression(updatedConfig.getCronExpression());
        config.setFixedRateMs(updatedConfig.getFixedRateMs());
        config.setEnabled(updatedConfig.isEnabled());
        config.setDescription(updatedConfig.getDescription());
        config.setUpdatedAt(LocalDateTime.now());
        
        return schedulerConfigRepository.save(config);
    }

    public List<SchedulerConfig> getAllSchedulerConfigs() {
        return schedulerConfigRepository.findAll();
    }

    public SchedulerConfig getSchedulerConfig(String taskName) {
        return schedulerConfigRepository.findByTaskName(taskName).orElse(null);
    }

    public boolean isTaskRunning(String taskName) {
        ScheduledFuture<?> future = scheduledTasks.get(taskName);
        return future != null && !future.isCancelled() && !future.isDone();
    }
}
