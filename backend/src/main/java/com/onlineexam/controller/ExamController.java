package com.onlineexam.controller;

import com.onlineexam.dto.ExamRequestDto;
import com.onlineexam.dto.ExamResponseDto;
import com.onlineexam.entity.ERole;
import com.onlineexam.entity.User;
import com.onlineexam.service.AuthService;
import com.onlineexam.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<ExamResponseDto>> getExams() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole().getName() == ERole.ROLE_ADMIN) {
            return ResponseEntity.ok(examService.getAllExams());
        } else if (currentUser.getRole().getName() == ERole.ROLE_TEACHER) {
            return ResponseEntity.ok(examService.getAllExams());
        } else {
            return ResponseEntity.ok(examService.getPublishedExams());
        }
    }

    @GetMapping("/published")
    public ResponseEntity<List<ExamResponseDto>> getPublishedExams() {
        return ResponseEntity.ok(examService.getPublishedExams());
    }

    @GetMapping("/my-exams")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<ExamResponseDto>> getMyExams() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(examService.getExamsByCreator(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponseDto> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ExamResponseDto> createExam(@Valid @RequestBody ExamRequestDto dto) {
        User currentUser = authService.getCurrentUser();
        ExamResponseDto created = examService.createExam(dto, currentUser);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ExamResponseDto> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequestDto dto) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(examService.updateExam(id, dto, currentUser));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ExamResponseDto> togglePublish(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(examService.togglePublishExam(id, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        examService.deleteExam(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
