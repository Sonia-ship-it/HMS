package com.sonia.hms.service;

import com.sonia.hms.dto.DoctorDto;
import com.sonia.hms.dto.PageResponse;
import com.sonia.hms.entity.Doctor;
import com.sonia.hms.entity.Role;
import com.sonia.hms.entity.UserAccount;
import com.sonia.hms.exception.ResourceNotFoundException;
import com.sonia.hms.repository.DoctorRepository;
import com.sonia.hms.repository.UserAccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    /** Default password assigned to every doctor account created by admin. */
    public static final String DEFAULT_DOCTOR_PASSWORD = "doctor123";

    private final DoctorRepository doctorRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository,
                         UserAccountRepository userAccountRepository,
                         PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public PageResponse<DoctorDto> list(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Doctor> result;
        if (search != null && !search.isBlank()) {
            String q = search.trim();
            result = doctorRepository.findByNameContainingIgnoreCaseOrSpecializationContainingIgnoreCase(q, q, pageable);
        } else {
            result = doctorRepository.findAll(pageable);
        }
        return PageResponse.from(result.map(DoctorDto::from));
    }

    public DoctorDto getById(Long id) {
        return DoctorDto.from(findEntity(id));
    }

    /**
     * Creates a Doctor entity AND a linked UserAccount with the default password.
     * The doctor's email is used as the login username.
     * If no email is provided, a generated username is used instead.
     */
    @Transactional
    public DoctorDto create(Doctor doctor) {
        Doctor saved = doctorRepository.save(doctor);
        ensureUserAccount(saved);
        return DoctorDto.from(saved);
    }

    @Transactional
    public DoctorDto update(Long id, Doctor updates) {
        Doctor doctor = findEntity(id);
        if (updates.getName() != null) doctor.setName(updates.getName());
        if (updates.getSpecialization() != null) doctor.setSpecialization(updates.getSpecialization());
        if (updates.getEmail() != null) doctor.setEmail(updates.getEmail());
        if (updates.getPhone() != null) doctor.setPhone(updates.getPhone());
        if (updates.getAvailability() != null) doctor.setAvailability(updates.getAvailability());
        if (updates.getAvailableDays() != null) doctor.setAvailableDays(updates.getAvailableDays());
        if (updates.getStartTime() != null) doctor.setStartTime(updates.getStartTime());
        if (updates.getEndTime() != null) doctor.setEndTime(updates.getEndTime());
        doctor.setActive(updates.isActive());
        Doctor saved = doctorRepository.save(doctor);

        // If the doctor now has an email but still has no account, create one
        ensureUserAccount(saved);

        return DoctorDto.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        Doctor d = findEntity(id);
        d.setActive(false);
        doctorRepository.save(d);
    }

    public Doctor findEntity(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    /**
     * Walks every Doctor row and creates a UserAccount for any that don't have one yet.
     * Called at startup (DataInitializer) and via the admin API endpoint.
     *
     * @return number of accounts that were created
     */
    @Transactional
    public int provisionMissingAccounts() {
        List<Doctor> all = doctorRepository.findAll();
        int created = 0;
        for (Doctor doctor : all) {
            boolean alreadyHasAccount = userAccountRepository
                    .findByDoctorProfileId(doctor.getId()).isPresent();
            if (!alreadyHasAccount) {
                ensureUserAccount(doctor);
                created++;
            }
        }
        return created;
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Creates a UserAccount for the given doctor if none exists yet.
     * Username = email (preferred) or "doctor-{id}" fallback.
     * Password = DEFAULT_DOCTOR_PASSWORD (bcrypt encoded).
     */
    private void ensureUserAccount(Doctor doctor) {
        // Already has an account? Nothing to do.
        if (userAccountRepository.findByDoctorProfileId(doctor.getId()).isPresent()) {
            return;
        }

        String username = resolveUsername(doctor);
        String email    = doctor.getEmail();

        // If the derived username is already taken by a different account, use fallback
        if (userAccountRepository.existsByUsername(username)) {
            username = "doctor-" + doctor.getId();
        }
        // If the email is already registered by a different account, clear it to avoid unique constraint
        if (email != null && userAccountRepository.existsByEmail(email)) {
            email = null;
        }

        UserAccount account = new UserAccount();
        account.setUsername(username);
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(DEFAULT_DOCTOR_PASSWORD));
        account.setRole(Role.DOCTOR);
        account.setFullName(doctor.getName());
        account.setPhone(doctor.getPhone());
        account.setEnabled(true);
        account.setDoctorProfile(doctor);

        userAccountRepository.save(account);
    }

    /**
     * Prefers the doctor's email as username; falls back to "doctor-{id}".
     */
    private String resolveUsername(Doctor doctor) {
        if (doctor.getEmail() != null && !doctor.getEmail().isBlank()) {
            return doctor.getEmail().trim().toLowerCase();
        }
        return "doctor-" + doctor.getId();
    }
}
