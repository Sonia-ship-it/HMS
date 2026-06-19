package com.sonia.hms.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long todayAppointments;
    private long activeQueueCount;
    private long highRiskPatients;
    private long checkInsToday;
    private long waitingPatients;
    private long pendingRequests;
    private List<Map<String, Object>> doctorWorkload;
    private List<Map<String, Object>> appointmentsPerDay;
    private List<Map<String, Object>> queueStats;

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(long todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public long getActiveQueueCount() {
        return activeQueueCount;
    }

    public void setActiveQueueCount(long activeQueueCount) {
        this.activeQueueCount = activeQueueCount;
    }

    public long getHighRiskPatients() {
        return highRiskPatients;
    }

    public void setHighRiskPatients(long highRiskPatients) {
        this.highRiskPatients = highRiskPatients;
    }

    public long getCheckInsToday() {
        return checkInsToday;
    }

    public void setCheckInsToday(long checkInsToday) {
        this.checkInsToday = checkInsToday;
    }

    public long getWaitingPatients() {
        return waitingPatients;
    }

    public void setWaitingPatients(long waitingPatients) {
        this.waitingPatients = waitingPatients;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public List<Map<String, Object>> getDoctorWorkload() {
        return doctorWorkload;
    }

    public void setDoctorWorkload(List<Map<String, Object>> doctorWorkload) {
        this.doctorWorkload = doctorWorkload;
    }

    public List<Map<String, Object>> getAppointmentsPerDay() {
        return appointmentsPerDay;
    }

    public void setAppointmentsPerDay(List<Map<String, Object>> appointmentsPerDay) {
        this.appointmentsPerDay = appointmentsPerDay;
    }

    public List<Map<String, Object>> getQueueStats() {
        return queueStats;
    }

    public void setQueueStats(List<Map<String, Object>> queueStats) {
        this.queueStats = queueStats;
    }
}
