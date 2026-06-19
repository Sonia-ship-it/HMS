package com.sonia.hms.service;

import com.sonia.hms.dto.QueueStatusDto;
import com.sonia.hms.entity.*;
import com.sonia.hms.exception.ResourceNotFoundException;
import com.sonia.hms.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QueueService {

    private static final int MINUTES_PER_POSITION = 12;

    private final QueueEntryRepository queueRepository;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    public QueueService(
            QueueEntryRepository queueRepository,
            DoctorService doctorService,
            NotificationService notificationService) {
        this.queueRepository = queueRepository;
        this.doctorService = doctorService;
        this.notificationService = notificationService;
    }

    @Transactional
    public void addToQueue(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        int position = queueRepository.countByDoctorIdAndSkippedFalseAndServingFalse(doctor.getId()) + 1;
        QueueEntry entry = new QueueEntry();
        entry.setDoctor(doctor);
        entry.setAppointment(appointment);
        entry.setPosition(position);
        entry.setEstimatedWaitTimeMinutes(position * MINUTES_PER_POSITION);
        entry.setServing(false);
        entry.setSkipped(false);
        appointment.setQueueEntry(entry);
        queueRepository.save(entry);
        notificationService.notifyAppointment(appointment, "Queue Update",
                "You are token #" + appointment.getTokenNumber() + ". Est. wait: " + entry.getEstimatedWaitTimeMinutes() + " min");
    }

    public QueueStatusDto getQueueStatus(Long doctorId) {
        Doctor doctor = doctorService.findEntity(doctorId);
        List<QueueEntry> entries = queueRepository.findByDoctorIdAndSkippedFalseOrderByPositionAsc(doctorId);
        QueueStatusDto dto = new QueueStatusDto();
        dto.setDoctorId(doctorId);
        dto.setDoctorName(doctor.getName());

        entries.stream().filter(QueueEntry::isServing).findFirst().ifPresent(current -> {
            dto.setCurrentToken(current.getAppointment().getTokenNumber());
            dto.setCurrentQueueEntryId(current.getId());
        });

        List<QueueStatusDto.WaitingTokenDto> waiting = entries.stream()
                .filter(e -> !e.isServing())
                .map(e -> {
                    QueueStatusDto.WaitingTokenDto w = new QueueStatusDto.WaitingTokenDto();
                    w.setQueueEntryId(e.getId());
                    w.setToken(e.getAppointment().getTokenNumber());
                    w.setPosition(e.getPosition());
                    w.setEstimatedWaitMinutes(e.getEstimatedWaitTimeMinutes());
                    w.setPatientName(e.getAppointment().getPatient().getName());
                    return w;
                })
                .collect(Collectors.toList());
        dto.setWaiting(waiting);
        dto.setTotalWaiting(waiting.size());
        dto.setAvgWaitMinutes(waiting.isEmpty() ? 0 :
                (int) waiting.stream().mapToInt(QueueStatusDto.WaitingTokenDto::getEstimatedWaitMinutes).average().orElse(0));
        return dto;
    }

    public List<Map<String, Object>> getBoard() {
        List<Map<String, Object>> board = new ArrayList<>();
        doctorService.list(0, 20, "id", "asc", null).getContent().forEach(doc -> {
            if (!doc.isActive()) return;
            QueueStatusDto status = getQueueStatus(doc.getId());
            Map<String, Object> row = new HashMap<>();
            row.put("doctorId", doc.getId());
            row.put("doctorName", doc.getName());
            row.put("room", "Room " + (doc.getId() % 5 + 1));
            row.put("currentToken", status.getCurrentToken());
            row.put("waitingCount", status.getTotalWaiting());
            board.add(row);
        });
        return board;
    }

    @Transactional
    public QueueStatusDto callNext(Long doctorId) {
        List<QueueEntry> entries = queueRepository.findByDoctorIdAndSkippedFalseOrderByPositionAsc(doctorId);
        // Clear all serving status first
        entries.forEach(e -> {
            e.setServing(false);
            queueRepository.save(e);
        });
        
        // Find next waiting patient and mark as serving
        QueueEntry next = entries.stream()
                .filter(e -> !e.isServing() && !e.isSkipped())
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No patients waiting in queue"));
        
        next.setServing(true);
        next.getAppointment().setStatus(AppointmentStatus.SERVING);
        queueRepository.save(next);
        
        return getQueueStatus(doctorId);
    }

    @Transactional
    public QueueStatusDto skip(Long queueEntryId) {
        QueueEntry entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found"));
        entry.setSkipped(true);
        entry.setServing(false);
        queueRepository.save(entry);
        recalculatePositions(entry.getDoctor().getId());
        return getQueueStatus(entry.getDoctor().getId());
    }

    @Transactional
    public QueueStatusDto complete(Long queueEntryId) {
        QueueEntry entry = queueRepository.findById(queueEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found"));
        entry.setServing(false);
        entry.setSkipped(true);
        Appointment appt = entry.getAppointment();
        appt.setStatus(AppointmentStatus.COMPLETED);
        queueRepository.save(entry);
        recalculatePositions(entry.getDoctor().getId());
        return getQueueStatus(entry.getDoctor().getId());
    }

    @Transactional
    public void recalculatePositions(Long doctorId) {
        List<QueueEntry> active = queueRepository.findByDoctorIdAndSkippedFalseOrderByPositionAsc(doctorId);
        int pos = 1;
        for (QueueEntry e : active) {
            if (!e.isSkipped()) {
                e.setPosition(pos);
                e.setEstimatedWaitTimeMinutes(pos * MINUTES_PER_POSITION);
                pos++;
            }
            queueRepository.save(e);
        }
    }

    public int countWaiting(Long doctorId) {
        return queueRepository.countByDoctorIdAndSkippedFalseAndServingFalse(doctorId);
    }

    public long countActiveQueues() {
        return queueRepository.findAll().stream()
                .filter(e -> !e.isSkipped() && !e.getAppointment().getStatus().equals(AppointmentStatus.COMPLETED))
                .map(e -> e.getDoctor().getId())
                .distinct()
                .count();
    }
}
