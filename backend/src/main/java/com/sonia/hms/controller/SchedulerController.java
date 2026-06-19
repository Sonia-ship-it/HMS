package com.sonia.hms.controller;

import com.sonia.hms.entity.SchedulerConfig;
import com.sonia.hms.service.DynamicSchedulerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedulers")
@Tag(name = "Scheduler", description = "Dynamic scheduler management (Admin only)")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class SchedulerController {

    private final DynamicSchedulerService schedulerService;

    public SchedulerController(DynamicSchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @GetMapping
    @Operation(summary = "Get all scheduler configurations")
    public ResponseEntity<List<SchedulerConfig>> getAllSchedulers() {
        return ResponseEntity.ok(schedulerService.getAllSchedulerConfigs());
    }

    @GetMapping("/{taskName}")
    @Operation(summary = "Get scheduler configuration by task name")
    public ResponseEntity<SchedulerConfig> getScheduler(@PathVariable String taskName) {
        SchedulerConfig config = schedulerService.getSchedulerConfig(taskName);
        return config != null ? ResponseEntity.ok(config) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update scheduler configuration")
    public ResponseEntity<SchedulerConfig> updateScheduler(
            @PathVariable Long id,
            @RequestBody SchedulerConfig updatedConfig) {
        SchedulerConfig config = schedulerService.updateSchedulerConfig(id, updatedConfig);
        return ResponseEntity.ok(config);
    }

    @PostMapping("/{taskName}/enable")
    @Operation(summary = "Enable a scheduler task")
    public ResponseEntity<String> enableScheduler(@PathVariable String taskName) {
        SchedulerConfig config = schedulerService.getSchedulerConfig(taskName);
        if (config != null) {
            config.setEnabled(true);
            schedulerService.updateSchedulerConfig(config.getId(), config);
            return ResponseEntity.ok("Scheduler " + taskName + " enabled");
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{taskName}/disable")
    @Operation(summary = "Disable a scheduler task")
    public ResponseEntity<String> disableScheduler(@PathVariable String taskName) {
        SchedulerConfig config = schedulerService.getSchedulerConfig(taskName);
        if (config != null) {
            config.setEnabled(false);
            schedulerService.updateSchedulerConfig(config.getId(), config);
            schedulerService.cancelTask(taskName);
            return ResponseEntity.ok("Scheduler " + taskName + " disabled");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{taskName}/status")
    @Operation(summary = "Check if a scheduler task is running")
    public ResponseEntity<String> getSchedulerStatus(@PathVariable String taskName) {
        boolean isRunning = schedulerService.isTaskRunning(taskName);
        SchedulerConfig config = schedulerService.getSchedulerConfig(taskName);
        
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        
        String status = String.format(
            "Task: %s, Enabled: %s, Running: %s, Executions: %d, Last: %s",
            taskName,
            config.isEnabled(),
            isRunning,
            config.getExecutionCount(),
            config.getLastExecuted()
        );
        
        return ResponseEntity.ok(status);
    }
}
