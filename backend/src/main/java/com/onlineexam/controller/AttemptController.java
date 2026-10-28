package com.onlineexam.controller;

import com.onlineexam.dto.ExamResultDto;
import com.onlineexam.dto.SaveAnswersRequestDto;
import com.onlineexam.dto.StartAttemptResponseDto;
import com.onlineexam.entity.User;
import com.onlineexam.service.AuthService;
import com.onlineexam.service.ExamAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AttemptController {

    @Autowired
    private ExamAttemptService examAttemptService;

    @Autowired
    private AuthService authService;

    @PostMapping("/exams/{examId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StartAttemptResponseDto> startExam(@PathVariable Long examId) {
        User student = authService.getCurrentUser();
        StartAttemptResponseDto response = examAttemptService.startExam(examId, student);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/attempts/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> saveAnswers(
            @PathVariable Long attemptId,
            @RequestBody SaveAnswersRequestDto dto) {
        User student = authService.getCurrentUser();
        examAttemptService.saveAnswers(attemptId, dto, student);
        return ResponseEntity.ok(Collections.singletonMap("message", "Answers autosaved successfully"));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamResultDto> submitExam(
            @PathVariable Long attemptId,
            @RequestBody(required = false) SaveAnswersRequestDto dto) {
        User student = authService.getCurrentUser();
        ExamResultDto result = examAttemptService.submitExam(attemptId, dto, student);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/attempts/{attemptId}/violation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> reportViolation(
            @PathVariable Long attemptId,
            @RequestBody Map<String, String> body) {
        User student = authService.getCurrentUser();
        String reason = body.getOrDefault("reason", "Proctoring violation detected");
        Map<String, Object> result = examAttemptService.recordViolation(attemptId, reason, student);
        return ResponseEntity.ok(result);
    }
}
