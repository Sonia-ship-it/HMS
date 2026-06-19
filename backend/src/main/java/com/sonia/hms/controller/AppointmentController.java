package com.sonia.hms.controller;

import com.sonia.hms.dto.AppointmentDto;
import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.entity.AppointmentStatus;
import com.sonia.hms.service.AppointmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public PageResponse<AppointmentDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) Long patientId) {
        return appointmentService.list(page, size, sortBy, sortDir, date, doctorId, status, patientId);
    }

    @GetMapping("/{id}")
    public AppointmentDto get(@PathVariable Long id) {
        return appointmentService.getById(id);
    }

    @PostMapping
    public AppointmentDto book(@RequestBody Map<String, Object> body) {
        return appointmentService.book(
                Long.valueOf(body.get("patientId").toString()),
                Long.valueOf(body.get("doctorId").toString()),
                LocalDate.parse(body.get("appointmentDate").toString()),
                LocalTime.parse(body.get("appointmentTime").toString()),
                body.get("notes") != null ? body.get("notes").toString() : null);
    }

    @GetMapping("/slots")
    public List<LocalTime> slots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.availableSlots(doctorId, date);
    }

    @PostMapping("/{id}/check-in")
    public AppointmentDto checkIn(@PathVariable Long id) {
        return appointmentService.checkIn(id);
    }

    @PostMapping("/{id}/reschedule")
    public AppointmentDto reschedule(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return appointmentService.reschedule(
                id,
                LocalDate.parse(body.get("appointmentDate")),
                LocalTime.parse(body.get("appointmentTime")));
    }

    @PostMapping("/{id}/cancel")
    public AppointmentDto cancel(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean late) {
        return appointmentService.cancel(id, late);
    }
}
