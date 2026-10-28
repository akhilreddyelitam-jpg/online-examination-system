package com.onlineexam.dto;

import com.onlineexam.entity.ExamResult;
import java.time.LocalDateTime;

public class ExamResultDto {
    private Long id;
    private Long attemptId;
    private Long examId;
    private String examTitle;
    private String subject;
    private Long studentId;
    private String studentName;
    private int totalQuestions;
    private int answeredQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private int unansweredQuestions;
    private Double marksObtained;
    private Double totalMarks;
    private Double percentage;
    private boolean passed;
    private boolean released;
    private int violationCount;
    private LocalDateTime createdAt;

    public ExamResultDto() {}

    public ExamResultDto(ExamResult r) {
        this.id = r.getId();
        if (r.getAttempt() != null) {
            this.attemptId = r.getAttempt().getId();
        }
        if (r.getExam() != null) {
            this.examId = r.getExam().getId();
            this.examTitle = r.getExam().getTitle();
            this.subject = r.getExam().getSubject();
        }
        if (r.getStudent() != null) {
            this.studentId = r.getStudent().getId();
            this.studentName = r.getStudent().getName();
        }
        this.totalQuestions = r.getTotalQuestions();
        this.answeredQuestions = r.getAnsweredQuestions();
        this.correctAnswers = r.getCorrectAnswers();
        this.wrongAnswers = r.getWrongAnswers();
        this.unansweredQuestions = r.getUnansweredQuestions();
        this.marksObtained = r.getMarksObtained();
        this.totalMarks = r.getTotalMarks();
        this.percentage = r.getPercentage();
        this.passed = r.isPassed();
        this.released = r.isReleased();
        this.violationCount = r.getViolationCount();
        this.createdAt = r.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getAnsweredQuestions() {
        return answeredQuestions;
    }

    public void setAnsweredQuestions(int answeredQuestions) {
        this.answeredQuestions = answeredQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getWrongAnswers() {
        return wrongAnswers;
    }

    public void setWrongAnswers(int wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }

    public int getUnansweredQuestions() {
        return unansweredQuestions;
    }

    public void setUnansweredQuestions(int unansweredQuestions) {
        this.unansweredQuestions = unansweredQuestions;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public boolean isReleased() {
        return released;
    }

    public void setReleased(boolean released) {
        this.released = released;
    }

    public int getViolationCount() {
        return violationCount;
    }

    public void setViolationCount(int violationCount) {
        this.violationCount = violationCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
