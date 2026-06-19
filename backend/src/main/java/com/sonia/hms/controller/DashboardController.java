package com.sonia.hms.controller;

import com.sonia.hms.dto.DashboardStatsDto;
import com.sonia.hms.entity.Role;
import com.sonia.hms.security.HospitalUserDetails;
import com.sonia.hms.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardStatsDto stats(@AuthenticationPrincipal HospitalUserDetails user) {
        Role role = user.getUser().getRole();
        return switch (role) {
            case ADMIN -> dashboardService.getAdminStats();
            case DOCTOR -> dashboardService.getDoctorStats(
                    user.getUser().getDoctorProfile() != null
                            ? user.getUser().getDoctorProfile().getId()
                            : 1L);
            case RECEPTIONIST -> dashboardService.getReceptionStats();
            case PATIENT -> {
                DashboardStatsDto d = new DashboardStatsDto();
                d.setTodayAppointments(0);
                yield d;
            }
        };
    }
}
