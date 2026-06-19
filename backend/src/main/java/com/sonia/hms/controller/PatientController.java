package com.sonia.hms.controller;

import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.dto.PatientDto;
import com.sonia.hms.entity.Patient;
import com.sonia.hms.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    @Operation(summary = "List patients with pagination and sorting")
    public PageResponse<PatientDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone) {
        return patientService.list(page, size, sortBy, sortDir, name, phone);
    }

    @GetMapping("/{id}")
    public PatientDto get(@PathVariable Long id) {
        return patientService.getById(id);
    }

    @PostMapping
    public PatientDto create(@RequestBody Patient patient) {
        return patientService.create(patient);
    }

    @PutMapping("/{id}")
    public PatientDto update(@PathVariable Long id, @RequestBody Patient patient) {
        return patientService.update(id, patient);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        patientService.delete(id);
    }
}
