package com.onlineexam.dto;

import com.onlineexam.entity.Exam;
import java.time.LocalDateTime;

public class ExamResponseDto {
    private Long id;
    private String title;
    private String subject;
    private String description;
    private Integer durationMinutes;
    private Double totalMarks;
    private Double passingPercentage;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean published;
    private boolean negativeMarkingEnabled;
    private Double defaultNegativeMarks;
    private boolean safeExamBrowserEnabled;
    private String createdByName;
    private Long createdById;
    private int questionCount;
    private LocalDateTime createdAt;

    public ExamResponseDto() {}

    public ExamResponseDto(Exam exam) {
        this.id = exam.getId();
        this.title = exam.getTitle();
        this.subject = exam.getSubject();
        this.description = exam.getDescription();
        this.durationMinutes = exam.getDurationMinutes();
        this.totalMarks = exam.getTotalMarks();
        this.passingPercentage = exam.getPassingPercentage();
        this.startTime = exam.getStartTime();
        this.endTime = exam.getEndTime();
        this.published = exam.isPublished();
        this.negativeMarkingEnabled = exam.isNegativeMarkingEnabled();
        this.defaultNegativeMarks = exam.getDefaultNegativeMarks();
        this.safeExamBrowserEnabled = exam.isSafeExamBrowserEnabled();
        if (exam.getCreatedBy() != null) {
            this.createdByName = exam.getCreatedBy().getName();
            this.createdById = exam.getCreatedBy().getId();
        }
        if (exam.getQuestions() != null) {
            this.questionCount = exam.getQuestions().size();
        }
        this.createdAt = exam.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Double getPassingPercentage() {
        return passingPercentage;
    }

    public void setPassingPercentage(Double passingPercentage) {
        this.passingPercentage = passingPercentage;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public boolean isNegativeMarkingEnabled() {
        return negativeMarkingEnabled;
    }

    public void setNegativeMarkingEnabled(boolean negativeMarkingEnabled) {
        this.negativeMarkingEnabled = negativeMarkingEnabled;
    }

    public Double getDefaultNegativeMarks() {
        return defaultNegativeMarks;
    }

    public void setDefaultNegativeMarks(Double defaultNegativeMarks) {
        this.defaultNegativeMarks = defaultNegativeMarks;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    public boolean isSafeExamBrowserEnabled() {
        return safeExamBrowserEnabled;
    }

    public void setSafeExamBrowserEnabled(boolean safeExamBrowserEnabled) {
        this.safeExamBrowserEnabled = safeExamBrowserEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
