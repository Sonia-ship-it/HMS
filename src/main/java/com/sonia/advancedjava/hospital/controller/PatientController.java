package com.sonia.advancedjava.hospital.controller;

import com.sonia.advancedjava.hospital.model.Patient;
import com.sonia.advancedjava.hospital.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(value = { "/api/patients", "/api/patients/" })
public class PatientController {

    private final PatientService patientService;

    @Autowired
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<Patient> getAll() {
        return patientService.getAllPatients();
    }

    @GetMapping("/pages")
    public Page<Patient> getPages(
            @RequestParam(defaultValue = "0") Integer pageNo,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "id") String sortBy) {
        return patientService.getPatientsPaginated(pageNo, pageSize, sortBy);
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @PostMapping
    public Patient create(@RequestBody Patient patient) {
        return patientService.addPatient(patient);
    }

    @PatchMapping("/{id}")
    public Patient update(@PathVariable Long id, @RequestBody Patient details) {
        return patientService.updatePatient(id, details);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        patientService.removePatient(id);
    }
}
