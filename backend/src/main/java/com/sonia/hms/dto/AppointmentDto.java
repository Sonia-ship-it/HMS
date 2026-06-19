package com.sonia.hms.dto;

import com.sonia.hms.entity.Appointment;
import com.sonia.hms.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private Integer tokenNumber;
    private String notes;
    private Integer estimatedWaitMinutes;

    public static AppointmentDto from(Appointment a) {
        AppointmentDto d = new AppointmentDto();
        d.id = a.getId();
        d.patientId = a.getPatient().getId();
        d.patientName = a.getPatient().getName();
        d.doctorId = a.getDoctor().getId();
        d.doctorName = a.getDoctor().getName();
        d.appointmentDate = a.getAppointmentDate();
        d.appointmentTime = a.getAppointmentTime();
        d.status = a.getStatus();
        d.tokenNumber = a.getTokenNumber();
        d.notes = a.getNotes();
        if (a.getQueueEntry() != null) {
            d.estimatedWaitMinutes = a.getQueueEntry().getEstimatedWaitTimeMinutes();
        }
        return d;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public Integer getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(Integer tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }
}
