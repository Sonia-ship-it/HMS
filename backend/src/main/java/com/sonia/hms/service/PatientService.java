package com.sonia.hms.service;

import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.dto.PatientDto;
import com.sonia.hms.entity.Patient;
import com.sonia.hms.exception.ResourceNotFoundException;
import com.sonia.hms.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public PageResponse<PatientDto> list(int page, int size, String sortBy, String sortDir, String name, String phone) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Patient> result;
        if (name != null && !name.isBlank()) {
            result = patientRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
        } else if (phone != null && !phone.isBlank()) {
            result = patientRepository.findByPhoneContaining(phone.trim(), pageable);
        } else {
            result = patientRepository.findAll(pageable);
        }
        Page<PatientDto> mapped = result.map(PatientDto::from);
        return PageResponse.from(mapped);
    }

    public PatientDto getById(Long id) {
        return PatientDto.from(findEntity(id));
    }

    @Transactional
    public PatientDto create(Patient patient) {
        patient.recalculateRiskScore();
        return PatientDto.from(patientRepository.save(patient));
    }

    @Transactional
    public PatientDto update(Long id, Patient updates) {
        Patient patient = findEntity(id);
        if (updates.getName() != null) patient.setName(updates.getName());
        if (updates.getEmail() != null) patient.setEmail(updates.getEmail());
        if (updates.getPhone() != null) patient.setPhone(updates.getPhone());
        if (updates.getAddress() != null) patient.setAddress(updates.getAddress());
        if (updates.getDateOfBirth() != null) patient.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) patient.setGender(updates.getGender());
        patient.recalculateRiskScore();
        return PatientDto.from(patientRepository.save(patient));
    }

    @Transactional
    public void delete(Long id) {
        patientRepository.delete(findEntity(id));
    }

    public Patient findEntity(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
    }

    @Transactional
    public void recordNoShow(Long patientId) {
        Patient p = findEntity(patientId);
        p.setMissedAppointments(p.getMissedAppointments() + 1);
        p.recalculateRiskScore();
        patientRepository.save(p);
    }

    @Transactional
    public void recordLateCancellation(Long patientId) {
        Patient p = findEntity(patientId);
        p.setLateCancellations(p.getLateCancellations() + 1);
        p.recalculateRiskScore();
        patientRepository.save(p);
    }
}
