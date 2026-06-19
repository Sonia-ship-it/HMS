package com.sonia.hms.dto;

import java.util.List;

public class QueueStatusDto {
    private Long doctorId;
    private String doctorName;
    private Integer currentToken;
    private Long currentQueueEntryId;
    private List<WaitingTokenDto> waiting;
    private int totalWaiting;
    private int avgWaitMinutes;

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

    public Integer getCurrentToken() {
        return currentToken;
    }

    public void setCurrentToken(Integer currentToken) {
        this.currentToken = currentToken;
    }

    public Long getCurrentQueueEntryId() {
        return currentQueueEntryId;
    }

    public void setCurrentQueueEntryId(Long currentQueueEntryId) {
        this.currentQueueEntryId = currentQueueEntryId;
    }

    public List<WaitingTokenDto> getWaiting() {
        return waiting;
    }

    public void setWaiting(List<WaitingTokenDto> waiting) {
        this.waiting = waiting;
    }

    public int getTotalWaiting() {
        return totalWaiting;
    }

    public void setTotalWaiting(int totalWaiting) {
        this.totalWaiting = totalWaiting;
    }

    public int getAvgWaitMinutes() {
        return avgWaitMinutes;
    }

    public void setAvgWaitMinutes(int avgWaitMinutes) {
        this.avgWaitMinutes = avgWaitMinutes;
    }

    public static class WaitingTokenDto {
        private Long queueEntryId;
        private Integer token;
        private int position;
        private int estimatedWaitMinutes;
        private String patientName;

        public Long getQueueEntryId() {
            return queueEntryId;
        }

        public void setQueueEntryId(Long queueEntryId) {
            this.queueEntryId = queueEntryId;
        }

        public Integer getToken() {
            return token;
        }

        public void setToken(Integer token) {
            this.token = token;
        }

        public int getPosition() {
            return position;
        }

        public void setPosition(int position) {
            this.position = position;
        }

        public int getEstimatedWaitMinutes() {
            return estimatedWaitMinutes;
        }

        public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
            this.estimatedWaitMinutes = estimatedWaitMinutes;
        }

        public String getPatientName() {
            return patientName;
        }

        public void setPatientName(String patientName) {
            this.patientName = patientName;
        }
    }
}
