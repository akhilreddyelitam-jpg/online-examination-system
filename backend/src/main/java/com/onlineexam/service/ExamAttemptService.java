package com.onlineexam.service;

import com.onlineexam.dto.*;
import com.onlineexam.entity.*;
import com.onlineexam.exception.BadRequestException;
import com.onlineexam.exception.ResourceNotFoundException;
import com.onlineexam.exception.UnauthorizedException;
import com.onlineexam.repository.ExamAttemptRepository;
import com.onlineexam.repository.QuestionRepository;
import com.onlineexam.repository.StudentResponseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExamAttemptService {

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private StudentResponseRepository studentResponseRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamService examService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private EvaluationService evaluationService;

    @Transactional
    public StartAttemptResponseDto startExam(Long examId, User student) {
        Exam exam = examService.getExamEntity(examId);

        if (!exam.isPublished()) {
            throw new BadRequestException("Examination is not yet published.");
        }

        LocalDateTime now = LocalDateTime.now();

        // Check start and end time window if configured
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new BadRequestException("Examination has not started yet. Starts at: " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new BadRequestException("Examination window has ended. Ended at: " + exam.getEndTime());
        }

        Optional<ExamAttempt> existingOpt = examAttemptRepository.findByExamIdAndStudentId(examId, student.getId());
        ExamAttempt attempt;

        if (existingOpt.isPresent()) {
            attempt = existingOpt.get();
            if (attempt.getStatus() == AttemptStatus.SUBMITTED || attempt.getStatus() == AttemptStatus.EXPIRED) {
                throw new BadRequestException("You have already submitted this examination.");
            }

            // Check if deadline has passed
            if (now.isAfter(attempt.getDeadlineTime())) {
                attempt.setStatus(AttemptStatus.EXPIRED);
                attempt.setSubmittedTime(attempt.getDeadlineTime());
                examAttemptRepository.save(attempt);
                evaluationService.evaluateAttempt(attempt);
                throw new BadRequestException("Examination time expired. Your examination was submitted automatically.");
            }
        } else {
            // Create new attempt
            attempt = new ExamAttempt();
            attempt.setExam(exam);
            attempt.setStudent(student);
            attempt.setStartTime(now);

            // Calculate hard server deadline
            LocalDateTime deadline = now.plusMinutes(exam.getDurationMinutes());
            if (exam.getEndTime() != null && exam.getEndTime().isBefore(deadline)) {
                deadline = exam.getEndTime();
            }
            attempt.setDeadlineTime(deadline);
            attempt.setStatus(AttemptStatus.IN_PROGRESS);

            attempt = examAttemptRepository.save(attempt);
        }

        StartAttemptResponseDto response = new StartAttemptResponseDto();
        response.setAttemptId(attempt.getId());
        response.setExamId(exam.getId());
        response.setExamTitle(exam.getTitle());
        response.setSubject(exam.getSubject());
        response.setDurationMinutes(exam.getDurationMinutes());
        response.setTotalMarks(exam.getTotalMarks());
        response.setStartTime(attempt.getStartTime());
        response.setDeadlineTime(attempt.getDeadlineTime());
        response.setSafeExamBrowserEnabled(exam.isSafeExamBrowserEnabled());
        response.setViolationCount(attempt.getViolationCount());

        long remaining = Duration.between(now, attempt.getDeadlineTime()).toSeconds();
        response.setRemainingSeconds(Math.max(0, remaining));

        // Secure student question list (no correct answers or explanations exposed)
        response.setQuestions(questionService.getQuestionsForStudent(examId));

        // Load currently saved answers
        List<StudentResponse> existingResponses = studentResponseRepository.findByAttemptId(attempt.getId());
        List<AnswerItemDto> savedAnswerDtos = existingResponses.stream()
                .map(r -> new AnswerItemDto(r.getQuestion().getId(), r.getSelectedOptionId(), r.isMarkedForReview()))
                .collect(Collectors.toList());
        response.setSavedAnswers(savedAnswerDtos);

        return response;
    }

    @Transactional
    public void saveAnswers(Long attemptId, SaveAnswersRequestDto dto, User student) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        validateStudentOwnership(attempt, student);

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Examination has already been submitted or expired.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(attempt.getDeadlineTime())) {
            // Deadline expired: auto submit
            attempt.setStatus(AttemptStatus.EXPIRED);
            attempt.setSubmittedTime(attempt.getDeadlineTime());
            examAttemptRepository.save(attempt);
            evaluationService.evaluateAttempt(attempt);
            throw new BadRequestException("Examination deadline has passed. Attempt auto-submitted.");
        }

        persistAnswers(attempt, dto.getAnswers());
    }

    @Transactional
    public ExamResultDto submitExam(Long attemptId, SaveAnswersRequestDto dto, User student) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        validateStudentOwnership(attempt, student);

        if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
            throw new BadRequestException("Examination has already been submitted.");
        }

        if (dto != null && dto.getAnswers() != null && !dto.getAnswers().isEmpty()) {
            persistAnswers(attempt, dto.getAnswers());
        }

        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedTime(LocalDateTime.now());
        examAttemptRepository.save(attempt);

        ExamResult result = evaluationService.evaluateAttempt(attempt);
        return new ExamResultDto(result);
    }

    private void persistAnswers(ExamAttempt attempt, List<AnswerItemDto> answerList) {
        if (answerList == null) return;

        for (AnswerItemDto answerDto : answerList) {
            if (answerDto.getQuestionId() == null) continue;

            Optional<StudentResponse> existingOpt =
                    studentResponseRepository.findByAttemptIdAndQuestionId(attempt.getId(), answerDto.getQuestionId());

            StudentResponse resp;
            if (existingOpt.isPresent()) {
                resp = existingOpt.get();
                resp.setSelectedOptionId(answerDto.getSelectedOptionId());
                resp.setMarkedForReview(answerDto.isMarkedForReview());
                resp.setSavedAt(LocalDateTime.now());
            } else {
                Question q = questionRepository.findById(answerDto.getQuestionId()).orElse(null);
                if (q != null) {
                    resp = new StudentResponse(attempt, q, answerDto.getSelectedOptionId(), answerDto.isMarkedForReview());
                } else {
                    continue;
                }
            }
            studentResponseRepository.save(resp);
        }
    }

    public ExamAttempt getAttemptEntity(Long attemptId) {
        return examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));
    }

    public void validateStudentOwnership(ExamAttempt attempt, User student) {
        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You do not own this examination attempt.");
        }
    }

    @Transactional
    public java.util.Map<String, Object> recordViolation(Long attemptId, String reason, User student) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));
        validateStudentOwnership(attempt, student);

        int count = attempt.getViolationCount() + 1;
        attempt.setViolationCount(count);
        String currentReason = attempt.getViolationReason() != null ? attempt.getViolationReason() + "; " : "";
        attempt.setViolationReason(currentReason + reason);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("violationCount", count);

        if (count >= 3) {
            // Auto submit due to 3 violations
            attempt.setStatus(AttemptStatus.SUBMITTED);
            attempt.setSubmittedTime(LocalDateTime.now());
            examAttemptRepository.save(attempt);
            evaluationService.evaluateAttempt(attempt);
            result.put("terminated", true);
            result.put("message", "Examination terminated and submitted due to reaching maximum proctoring violation limit (3 strikes).");
        } else {
            examAttemptRepository.save(attempt);
            result.put("terminated", false);
            result.put("message", "Violation " + count + " of 3 recorded: " + reason);
        }

        return result;
    }
}
