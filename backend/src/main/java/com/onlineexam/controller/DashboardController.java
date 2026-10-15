package com.onlineexam.controller;

import com.onlineexam.dto.AdminStatsDto;
import com.onlineexam.dto.StudentStatsDto;
import com.onlineexam.dto.TeacherStatsDto;
import com.onlineexam.entity.User;
import com.onlineexam.service.AuthService;
import com.onlineexam.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AuthService authService;

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsDto> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/teacher/stats")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<TeacherStatsDto> getTeacherStats() {
        User teacher = authService.getCurrentUser();
        return ResponseEntity.ok(dashboardService.getTeacherStats(teacher));
    }

    @GetMapping("/student/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentStatsDto> getStudentStats() {
        User student = authService.getCurrentUser();
        return ResponseEntity.ok(dashboardService.getStudentStats(student));
    }
}
