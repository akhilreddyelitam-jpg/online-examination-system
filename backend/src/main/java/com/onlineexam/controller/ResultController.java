package com.onlineexam.controller;

import com.onlineexam.dto.ExamResultDto;
import com.onlineexam.dto.ResultDetailDto;
import com.onlineexam.entity.User;
import com.onlineexam.service.AuthService;
import com.onlineexam.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultService resultService;

    @Autowired
    private AuthService authService;

    @GetMapping("/my-results")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamResultDto>> getMyResults() {
        User student = authService.getCurrentUser();
        return ResponseEntity.ok(resultService.getMyResults(student));
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ResultDetailDto> getResultByAttemptId(@PathVariable Long attemptId) {
        User requester = authService.getCurrentUser();
        return ResponseEntity.ok(resultService.getResultByAttemptId(attemptId, requester));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<ExamResultDto>> getResultsByExamId(@PathVariable Long examId) {
        User requester = authService.getCurrentUser();
        return ResponseEntity.ok(resultService.getResultsByExamId(examId, requester));
    }
}
