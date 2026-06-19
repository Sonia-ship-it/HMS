package com.sonia.hms.scheduler;

import com.sonia.hms.entity.QueueEntry;
import com.sonia.hms.repository.QueueEntryRepository;
import com.sonia.hms.service.DynamicSchedulerService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Dynamic scheduled task: recalculates estimated wait times for queue entries.
 * Schedule can be changed at runtime via database configuration.
 */
@Component
public class QueueWaitTimeScheduler {

    private static final Logger log = LoggerFactory.getLogger(QueueWaitTimeScheduler.class);
    private static final String TASK_WAIT_TIME = "update-queue-wait-time";
    private static final int MINUTES_PER_POSITION = 12;

    private final QueueEntryRepository queueRepository;
    private final DynamicSchedulerService schedulerService;

    public QueueWaitTimeScheduler(QueueEntryRepository queueRepository,
                                  DynamicSchedulerService schedulerService) {
        this.queueRepository = queueRepository;
        this.schedulerService = schedulerService;
    }

    @PostConstruct
    public void initSchedule() {
        schedulerService.scheduleTask(TASK_WAIT_TIME, this::updateWaitEstimates);
        log.info("Queue wait time scheduler initialized");
    }

    @Transactional
    public void updateWaitEstimates() {
        List<QueueEntry> all = queueRepository.findAll();
        int updated = 0;
        for (QueueEntry entry : all) {
            if (!entry.isSkipped()) {
                int wait = entry.getPosition() * MINUTES_PER_POSITION;
                if (entry.isServing()) wait = 0;
                entry.setEstimatedWaitTimeMinutes(wait);
                queueRepository.save(entry);
                updated++;
            }
        }
        if (updated > 0) {
            log.debug("Updated wait estimates for {} queue entries", updated);
        }
    }
}
