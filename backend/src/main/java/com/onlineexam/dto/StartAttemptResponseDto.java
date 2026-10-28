package com.onlineexam.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StartAttemptResponseDto {
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private String subject;
    private Integer durationMinutes;
    private Double totalMarks;
    private LocalDateTime startTime;
    private LocalDateTime deadlineTime;
    private long remainingSeconds;
    private boolean safeExamBrowserEnabled = true;
    private int violationCount = 0;
    private List<QuestionStudentDto> questions = new ArrayList<>();
    private List<AnswerItemDto> savedAnswers = new ArrayList<>();

    public StartAttemptResponseDto() {}

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getDeadlineTime() {
        return deadlineTime;
    }

    public void setDeadlineTime(LocalDateTime deadlineTime) {
        this.deadlineTime = deadlineTime;
    }

    public long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public List<QuestionStudentDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionStudentDto> questions) {
        this.questions = questions;
    }

    public List<AnswerItemDto> getSavedAnswers() {
        return savedAnswers;
    }

    public void setSavedAnswers(List<AnswerItemDto> savedAnswers) {
        this.savedAnswers = savedAnswers;
    }

    public boolean isSafeExamBrowserEnabled() {
        return safeExamBrowserEnabled;
    }

    public void setSafeExamBrowserEnabled(boolean safeExamBrowserEnabled) {
        this.safeExamBrowserEnabled = safeExamBrowserEnabled;
    }

    public int getViolationCount() {
        return violationCount;
    }

    public void setViolationCount(int violationCount) {
        this.violationCount = violationCount;
    }
}
