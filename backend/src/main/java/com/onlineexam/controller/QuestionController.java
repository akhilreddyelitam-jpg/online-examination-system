package com.onlineexam.controller;

import com.onlineexam.dto.QuestionRequestDto;
import com.onlineexam.dto.QuestionResponseDto;
import com.onlineexam.entity.ERole;
import com.onlineexam.entity.User;
import com.onlineexam.service.AuthService;
import com.onlineexam.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AuthService authService;

    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<?> getQuestionsForExam(@PathVariable Long examId) {
        User user = authService.getCurrentUser();
        if (user.getRole().getName() == ERole.ROLE_STUDENT) {
            // Students only receive sanitized questions (no correct answers or explanations)
            return ResponseEntity.ok(questionService.getQuestionsForStudent(examId));
        } else {
            return ResponseEntity.ok(questionService.getQuestionsByExamId(examId));
        }
    }

    @PostMapping("/exams/{examId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<QuestionResponseDto> addQuestion(
            @PathVariable Long examId,
            @Valid @RequestBody QuestionRequestDto dto) {
        User user = authService.getCurrentUser();
        QuestionResponseDto created = questionService.addQuestionToExam(examId, dto, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<QuestionResponseDto> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<QuestionResponseDto> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequestDto dto) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(questionService.updateQuestion(id, dto, user));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        questionService.deleteQuestion(id, user);
        return ResponseEntity.noContent().build();
    }
}
