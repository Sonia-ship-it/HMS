package com.sonia.hms.service;

import com.sonia.hms.dto.DashboardStatsDto;
import com.sonia.hms.entity.AppointmentStatus;
import com.sonia.hms.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueEntryRepository queueRepository;

    public DashboardService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            QueueEntryRepository queueRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.queueRepository = queueRepository;
    }

    public DashboardStatsDto getAdminStats() {
        LocalDate today = LocalDate.now();
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalPatients(patientRepository.count());
        stats.setTotalDoctors(doctorRepository.countByActiveTrue());
        stats.setTodayAppointments(appointmentRepository.countByAppointmentDate(today));
        stats.setActiveQueueCount(queueRepository.findAll().stream()
                .filter(q -> !q.isSkipped() && q.getAppointment().getStatus() == AppointmentStatus.IN_QUEUE)
                .count());
        stats.setHighRiskPatients(patientRepository.countByNoShowRiskScoreGreaterThan(29));
        stats.setDoctorWorkload(buildDoctorWorkload(today));
        stats.setAppointmentsPerDay(buildAppointmentsPerDay(today.minusDays(6), today));
        stats.setQueueStats(buildQueueStats());
        return stats;
    }

    public DashboardStatsDto getDoctorStats(Long doctorId) {
        LocalDate today = LocalDate.now();
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTodayAppointments(appointmentRepository.countByDoctorIdAndAppointmentDate(doctorId, today));
        stats.setWaitingPatients(queueRepository.countByDoctorIdAndSkippedFalseAndServingFalse(doctorId));
        return stats;
    }

    public DashboardStatsDto getReceptionStats() {
        LocalDate today = LocalDate.now();
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setCheckInsToday(appointmentRepository.findByAppointmentDateAndStatus(today, AppointmentStatus.CHECKED_IN).size()
                + appointmentRepository.findByAppointmentDateAndStatus(today, AppointmentStatus.IN_QUEUE).size());
        stats.setWaitingPatients(queueRepository.findAll().stream().filter(q -> !q.isSkipped() && !q.isServing()).count());
        stats.setPendingRequests(appointmentRepository.findByAppointmentDateAndStatus(today, AppointmentStatus.SCHEDULED).size());
        return stats;
    }

    private List<Map<String, Object>> buildDoctorWorkload(LocalDate date) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : appointmentRepository.countAppointmentsPerDoctor(date)) {
            Map<String, Object> m = new HashMap<>();
            m.put("doctorId", row[0]);
            m.put("appointments", row[1]);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> buildAppointmentsPerDay(LocalDate start, LocalDate end) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : appointmentRepository.countAppointmentsPerDay(start, end)) {
            Map<String, Object> m = new HashMap<>();
            m.put("date", row[0].toString());
            m.put("count", row[1]);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> buildQueueStats() {
        List<Map<String, Object>> list = new ArrayList<>();
        doctorRepository.findAll().forEach(d -> {
            int waiting = queueRepository.countByDoctorIdAndSkippedFalseAndServingFalse(d.getId());
            if (waiting > 0) {
                Map<String, Object> m = new HashMap<>();
                m.put("doctor", d.getName());
                m.put("waiting", waiting);
                list.add(m);
            }
        });
        return list;
    }
}
