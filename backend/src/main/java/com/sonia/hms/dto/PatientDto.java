package com.sonia.hms.dto;

import com.sonia.hms.entity.Gender;
import com.sonia.hms.entity.Patient;

import java.time.LocalDate;

public class PatientDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private int noShowRiskScore;
    private int missedAppointments;
    private int lateCancellations;
    private boolean highRisk;

    public static PatientDto from(Patient p) {
        PatientDto d = new PatientDto();
        d.id = p.getId();
        d.name = p.getName();
        d.email = p.getEmail();
        d.phone = p.getPhone();
        d.address = p.getAddress();
        d.dateOfBirth = p.getDateOfBirth();
        d.gender = p.getGender();
        d.noShowRiskScore = p.getNoShowRiskScore();
        d.missedAppointments = p.getMissedAppointments();
        d.lateCancellations = p.getLateCancellations();
        d.highRisk = p.getNoShowRiskScore() >= 30;
        return d;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public int getNoShowRiskScore() {
        return noShowRiskScore;
    }

    public void setNoShowRiskScore(int noShowRiskScore) {
        this.noShowRiskScore = noShowRiskScore;
    }

    public int getMissedAppointments() {
        return missedAppointments;
    }

    public void setMissedAppointments(int missedAppointments) {
        this.missedAppointments = missedAppointments;
    }

    public int getLateCancellations() {
        return lateCancellations;
    }

    public void setLateCancellations(int lateCancellations) {
        this.lateCancellations = lateCancellations;
    }

    public boolean isHighRisk() {
        return highRisk;
    }

    public void setHighRisk(boolean highRisk) {
        this.highRisk = highRisk;
    }
}
