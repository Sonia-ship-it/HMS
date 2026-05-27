package com.sonia.advancedjava.hospital.service;

import com.sonia.advancedjava.hospital.model.Patient;
import com.sonia.advancedjava.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Page<Patient> getPatientsPaginated(Integer pageNo, Integer pageSize, String sortBy) {
        Pageable paging = PageRequest.of(pageNo, pageSize, Sort.by(sortBy));
        return patientRepository.findAll(paging);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }

    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id).orElse(null);
        if (patient != null) {
            if (patientDetails.getName() != null) {
                patient.setName(patientDetails.getName());
            }
            if (patientDetails.getAge() != 0) {
                patient.setAge(patientDetails.getAge());
            }
            if (patientDetails.getDiagnosis() != null) {
                patient.setDiagnosis(patientDetails.getDiagnosis());
            }
            return patientRepository.save(patient);
        }
        return null;
    }

    public void removePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
