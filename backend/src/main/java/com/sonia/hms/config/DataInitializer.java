package com.sonia.hms.config;

import com.sonia.hms.entity.*;
import com.sonia.hms.repository.*;
import com.sonia.hms.service.DoctorService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserAccountRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalSettingsRepository settingsRepository;
    private final SchedulerConfigRepository schedulerConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorService doctorService;

    public DataInitializer(
            UserAccountRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            HospitalSettingsRepository settingsRepository,
            SchedulerConfigRepository schedulerConfigRepository,
            PasswordEncoder passwordEncoder,
            DoctorService doctorService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.settingsRepository = settingsRepository;
        this.schedulerConfigRepository = schedulerConfigRepository;
        this.passwordEncoder = passwordEncoder;
        this.doctorService = doctorService;
    }

    @Override
    public void run(String... args) {
        // Initialize Scheduler Configurations (always check and create if missing)
        if (schedulerConfigRepository.count() == 0) {
            initSchedulerConfigs();
        }

        // Provision accounts for any doctor that doesn't have one yet
        // (handles doctors created by admin before this feature existed)
        doctorService.provisionMissingAccounts();

        // Skip other data initialization if users already exist
        if (userRepository.count() > 0) return;

        HospitalSettings settings = new HospitalSettings();
        settings.setHospitalName("Smart City General Hospital");
        settings.setAddress("123 Health Avenue, Medical District");
        settings.setContactNumber("+1 (555) 010-2000");
        settings.setWorkingHours("Mon–Sat 8:00 AM – 8:00 PM");
        settingsRepository.save(settings);

        // Create Doctors
        Doctor d1 = new Doctor();
        d1.setName("Dr. Sarah Mitchell");
        d1.setSpecialization("Cardiology");
        d1.setEmail("s.mitchell@hospital.local");
        d1.setPhone("+1-555-1001");
        d1.setAvailableDays("Mon,Tue,Wed,Thu,Fri");
        d1.setStartTime(LocalTime.of(9, 0));
        d1.setEndTime(LocalTime.of(17, 0));
        d1.setAvailability("Available");
        doctorRepository.save(d1);

        Doctor d2 = new Doctor();
        d2.setName("Dr. James Chen");
        d2.setSpecialization("General Medicine");
        d2.setEmail("j.chen@hospital.local");
        d2.setPhone("+1-555-1002");
        d2.setAvailableDays("Mon,Tue,Wed,Thu,Fri,Sat");
        d2.setStartTime(LocalTime.of(8, 0));
        d2.setEndTime(LocalTime.of(16, 0));
        d2.setAvailability("Available");
        doctorRepository.save(d2);

        // Create Patients
        Patient p1 = new Patient();
        p1.setName("John Doe");
        p1.setEmail("john.doe@email.com");
        p1.setPhone("+1-555-2001");
        p1.setDateOfBirth(LocalDate.of(1990, 5, 15));
        p1.setGender(Gender.MALE);
        p1.setAddress("45 Oak Street");
        p1.recalculateRiskScore();
        patientRepository.save(p1);

        Patient p2 = new Patient();
        p2.setName("Emma Wilson");
        p2.setEmail("emma.wilson@email.com");
        p2.setPhone("+1-555-2002");
        p2.setDateOfBirth(LocalDate.of(1985, 8, 22));
        p2.setGender(Gender.FEMALE);
        p2.setAddress("78 Maple Avenue");
        p2.recalculateRiskScore();
        patientRepository.save(p2);

        Patient p3 = new Patient();
        p3.setName("Michael Brown");
        p3.setEmail("michael.brown@email.com");
        p3.setPhone("+1-555-2003");
        p3.setDateOfBirth(LocalDate.of(1978, 12, 10));
        p3.setGender(Gender.MALE);
        p3.setAddress("92 Pine Road");
        p3.recalculateRiskScore();
        patientRepository.save(p3);

        // Create User Accounts
        createUser("admin", "admin123", Role.ADMIN, "System Administrator", null, null);
        createUser("reception", "reception123", Role.RECEPTIONIST, "Maria Lopez", null, null);
        createUser("doctor1", "doctor123", Role.DOCTOR, d1.getName(), null, d1);
        createUser("doctor2", "doctor123", Role.DOCTOR, d2.getName(), null, d2);
        createUser("patient1", "patient123", Role.PATIENT, p1.getName(), p1, null);
        createUser("patient2", "patient123", Role.PATIENT, p2.getName(), p2, null);
        createUser("patient3", "patient123", Role.PATIENT, p3.getName(), p3, null);
    }

    private void createUser(String username, String password, Role role, String fullName,
                            Patient patient, Doctor doctor) {
        UserAccount u = new UserAccount();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        u.setFullName(fullName);
        u.setEnabled(true);
        if (patient != null) {
            u.setPatientProfile(patient);
            u.setEmail(patient.getEmail());
        }
        if (doctor != null) {
            u.setDoctorProfile(doctor);
            u.setEmail(doctor.getEmail());
        }
        userRepository.save(u);
    }

    private void initSchedulerConfigs() {
        // 1. Mark No-Shows Task (Hourly)
        SchedulerConfig noShowTask = new SchedulerConfig();
        noShowTask.setTaskName("mark-no-shows");
        noShowTask.setCronExpression("0 0 * * * *"); // Every hour
        noShowTask.setEnabled(true);
        noShowTask.setDescription("Marks appointments as NO_SHOW if patient didn't show up 30 minutes past appointment time");
        schedulerConfigRepository.save(noShowTask);

        // 2. Daily Summary Task (Midnight)
        SchedulerConfig dailyTask = new SchedulerConfig();
        dailyTask.setTaskName("daily-summary");
        dailyTask.setCronExpression("0 0 0 * * *"); // Daily at midnight
        dailyTask.setEnabled(true);
        dailyTask.setDescription("Logs daily appointment summary statistics");
        schedulerConfigRepository.save(dailyTask);

        // 3. Queue Wait Time Update (Every 5 minutes)
        SchedulerConfig queueTask = new SchedulerConfig();
        queueTask.setTaskName("update-queue-wait-time");
        queueTask.setFixedRateMs(300000L); // 5 minutes = 300,000 ms
        queueTask.setEnabled(true);
        queueTask.setDescription("Updates estimated wait times for all queue entries");
        schedulerConfigRepository.save(queueTask);
    }
}
