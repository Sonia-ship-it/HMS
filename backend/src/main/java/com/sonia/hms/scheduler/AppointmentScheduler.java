package com.sonia.hms.scheduler;

import com.sonia.hms.entity.Appointment;
import com.sonia.hms.entity.AppointmentStatus;
import com.sonia.hms.repository.AppointmentRepository;
import com.sonia.hms.service.DynamicSchedulerService;
import com.sonia.hms.service.PatientService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Dynamic scheduled tasks: mark no-shows and log daily summary.
 * Schedule can be changed at runtime via database configuration.
 */
@Component
public class AppointmentScheduler {

    private static final Logger log = LoggerFactory.getLogger(AppointmentScheduler.class);
    private static final String TASK_NO_SHOW = "mark-no-shows";
    private static final String TASK_DAILY_SUMMARY = "daily-summary";

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DynamicSchedulerService schedulerService;

    public AppointmentScheduler(AppointmentRepository appointmentRepository, 
                                PatientService patientService,
                                DynamicSchedulerService schedulerService) {
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
        this.schedulerService = schedulerService;
    }

    @PostConstruct
    public void initSchedules() {
        // Schedule mark no-shows task
        schedulerService.scheduleTask(TASK_NO_SHOW, this::markNoShows);
        
        // Schedule daily summary task
        schedulerService.scheduleTask(TASK_DAILY_SUMMARY, this::dailySummary);
        
        log.info("Appointment schedulers initialized");
    }

    /** Mark past scheduled appointments as no-show */
    @Transactional
    public void markNoShows() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().minusMinutes(30);
        List<Appointment> overdue = appointmentRepository
                .findByAppointmentDateAndAppointmentTimeBeforeAndStatus(today, now, AppointmentStatus.SCHEDULED);
        
        int count = 0;
        for (Appointment appt : overdue) {
            appt.setStatus(AppointmentStatus.NO_SHOW);
            appointmentRepository.save(appt);
            patientService.recordNoShow(appt.getPatient().getId());
            count++;
        }
        
        if (count > 0) {
            log.info("Marked {} appointments as no-show", count);
        }
    }

    /** Log daily summary */
    public void dailySummary() {
        long count = appointmentRepository.countByAppointmentDate(LocalDate.now().minusDays(1));
        log.info("Yesterday's appointments: {}", count);
    }
}
