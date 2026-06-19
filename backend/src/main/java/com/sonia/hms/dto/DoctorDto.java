package com.sonia.hms.dto;

import com.sonia.hms.entity.Doctor;

import java.time.LocalTime;

public class DoctorDto {
    private Long id;
    private String name;
    private String specialization;
    private String email;
    private String phone;
    private String availability;
    private String availableDays;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;

    public static DoctorDto from(Doctor d) {
        DoctorDto dto = new DoctorDto();
        dto.id = d.getId();
        dto.name = d.getName();
        dto.specialization = d.getSpecialization();
        dto.email = d.getEmail();
        dto.phone = d.getPhone();
        dto.availability = d.getAvailability();
        dto.availableDays = d.getAvailableDays();
        dto.startTime = d.getStartTime();
        dto.endTime = d.getEndTime();
        dto.active = d.isActive();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getAvailableDays() {
        return availableDays;
    }

    public void setAvailableDays(String availableDays) {
        this.availableDays = availableDays;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
