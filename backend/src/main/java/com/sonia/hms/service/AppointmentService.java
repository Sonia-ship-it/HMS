package com.sonia.hms.service;

import com.sonia.hms.dto.AppointmentDto;
import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.entity.*;
import com.sonia.hms.exception.ResourceNotFoundException;
import com.sonia.hms.repository.AppointmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    private static final int AVG_MINUTES_PER_PATIENT = 15;

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final QueueService queueService;
    private final NotificationService notificationService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientService patientService,
            DoctorService doctorService,
            @Lazy QueueService queueService,
            NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.queueService = queueService;
        this.notificationService = notificationService;
    }

    public PageResponse<AppointmentDto> list(
            int page, int size, String sortBy, String sortDir,
            LocalDate date, Long doctorId, AppointmentStatus status) {
        return list(page, size, sortBy, sortDir, date, doctorId, status, null);
    }

    public PageResponse<AppointmentDto> list(
            int page, int size, String sortBy, String sortDir,
            LocalDate date, Long doctorId, AppointmentStatus status, Long patientId) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Appointment> result;
        if (patientId != null) {
            result = appointmentRepository.findByPatientId(patientId, pageable);
        } else if (date != null && doctorId != null) {
            result = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date, pageable);
        } else if (date != null) {
            result = appointmentRepository.findByAppointmentDate(date, pageable);
        } else if (status != null) {
            result = appointmentRepository.findByStatus(status, pageable);
        } else {
            result = appointmentRepository.findAll(pageable);
        }
        return PageResponse.from(result.map(AppointmentDto::from));
    }

    public AppointmentDto getById(Long id) {
        return AppointmentDto.from(findEntity(id));
    }

    @Transactional
    public AppointmentDto book(Long patientId, Long doctorId, LocalDate date, LocalTime time, String notes) {
        Patient patient = patientService.findEntity(patientId);
        Doctor doctor = doctorService.findEntity(doctorId);
        if (patient.getNoShowRiskScore() >= 50) {
            throw new IllegalArgumentException("High no-show risk. Contact reception to book.");
        }
        int nextToken = (int) appointmentRepository.countByDoctorIdAndAppointmentDate(doctorId, date) + 1;
        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setDoctor(doctor);
        appt.setAppointmentDate(date);
        appt.setAppointmentTime(time);
        appt.setStatus(AppointmentStatus.SCHEDULED);
        appt.setTokenNumber(nextToken);
        appt.setNotes(notes);
        Appointment saved = appointmentRepository.save(appt);
        notificationService.notifyAppointment(saved, "Appointment Confirmed",
                "Your appointment with Dr. " + doctor.getName() + " on " + date + " at " + time);
        return AppointmentDto.from(saved);
    }

    @Transactional
    public AppointmentDto reschedule(Long id, LocalDate newDate, LocalTime newTime) {
        Appointment appt = findEntity(id);
        appt.setAppointmentDate(newDate);
        appt.setAppointmentTime(newTime);
        appt.setStatus(AppointmentStatus.RESCHEDULED);
        Appointment saved = appointmentRepository.save(appt);
        notificationService.notifyAppointment(saved, "Appointment Rescheduled",
                "Rescheduled to " + newDate + " at " + newTime);
        return AppointmentDto.from(saved);
    }

    @Transactional
    public AppointmentDto cancel(Long id, boolean late) {
        Appointment appt = findEntity(id);
        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setCancelledAt(LocalDateTime.now());
        appt.setLateCancellation(late);
        if (late) {
            patientService.recordLateCancellation(appt.getPatient().getId());
        }
        appointmentRepository.save(appt);
        notificationService.notifyAppointment(appt, "Appointment Cancelled", "Your appointment was cancelled.");
        return AppointmentDto.from(appt);
    }

    @Transactional
    public AppointmentDto checkIn(Long id) {
        Appointment appt = findEntity(id);
        appt.setStatus(AppointmentStatus.CHECKED_IN);
        appointmentRepository.save(appt);
        queueService.addToQueue(appt);
        appt.setStatus(AppointmentStatus.IN_QUEUE);
        return AppointmentDto.from(appointmentRepository.save(appt));
    }

    public List<LocalTime> availableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorService.findEntity(doctorId);
        LocalTime start = doctor.getStartTime() != null ? doctor.getStartTime() : LocalTime.of(9, 0);
        LocalTime end = doctor.getEndTime() != null ? doctor.getEndTime() : LocalTime.of(17, 0);
        List<LocalTime> slots = new java.util.ArrayList<>();
        LocalTime t = start;
        while (t.isBefore(end)) {
            final LocalTime slot = t;
            boolean taken = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date, Pageable.unpaged())
                    .stream()
                    .anyMatch(a -> a.getAppointmentTime() != null && a.getAppointmentTime().equals(slot)
                            && a.getStatus() != AppointmentStatus.CANCELLED);
            if (!taken) slots.add(t);
            t = t.plusMinutes(30);
        }
        return slots;
    }

    public Appointment findEntity(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    public int estimateWaitMinutes(Long doctorId) {
        return queueService.countWaiting(doctorId) * AVG_MINUTES_PER_PATIENT;
    }
}
