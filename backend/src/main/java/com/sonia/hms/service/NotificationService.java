package com.sonia.hms.service;

import com.sonia.hms.entity.Appointment;
import com.sonia.hms.entity.Notification;
import com.sonia.hms.entity.UserAccount;
import com.sonia.hms.repository.NotificationRepository;
import com.sonia.hms.repository.UserAccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserAccountRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserAccountRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyAppointment(Appointment appt, String title, String message) {
        userRepository.findAll().stream()
                .filter(u -> u.getPatientProfile() != null
                        && u.getPatientProfile().getId().equals(appt.getPatient().getId()))
                .forEach(u -> create(u, title, message, "APPOINTMENT"));
    }

    @Transactional
    public void create(UserAccount user, String title, String message, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        notificationRepository.save(n);
    }

    public Page<Notification> listForUser(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    @Transactional
    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
