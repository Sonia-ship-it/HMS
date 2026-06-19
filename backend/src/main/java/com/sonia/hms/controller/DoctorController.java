package com.sonia.hms.controller;

import com.sonia.hms.dto.DoctorDto;
import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.entity.Doctor;
import com.sonia.hms.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public PageResponse<DoctorDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search) {
        return doctorService.list(page, size, sortBy, sortDir, search);
    }

    @GetMapping("/{id}")
    public DoctorDto get(@PathVariable Long id) {
        return doctorService.getById(id);
    }

    @PostMapping
    public DoctorDto create(@RequestBody Doctor doctor) {
        return doctorService.create(doctor);
    }

    @PutMapping("/{id}")
    public DoctorDto update(@PathVariable Long id, @RequestBody Doctor doctor) {
        return doctorService.update(id, doctor);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        doctorService.delete(id);
    }

    /**
     * Admin-only: creates UserAccount (password = "doctor123") for every doctor
     * that was created before this feature was added and has no login yet.
     */
    @PostMapping("/provision-accounts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Provision missing doctor login accounts (admin only)")
    public Map<String, Object> provisionAccounts() {
        int created = doctorService.provisionMissingAccounts();
        return Map.of(
                "message", created + " doctor account(s) created with default password \"doctor123\"",
                "accountsCreated", created
        );
    }
}
