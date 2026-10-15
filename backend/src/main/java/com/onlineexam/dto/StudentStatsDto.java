package com.onlineexam.dto;

import java.util.ArrayList;
import java.util.List;

public class StudentStatsDto {
    private long availableExams;
    private long completedExams;
    private Double averageScore;
    private long passedExams;
    private List<ExamResponseDto> upcomingExams = new ArrayList<>();
    private List<ExamResultDto> recentResults = new ArrayList<>();

    public StudentStatsDto() {}

    public long getAvailableExams() {
        return availableExams;
    }

    public void setAvailableExams(long availableExams) {
        this.availableExams = availableExams;
    }

    public long getCompletedExams() {
        return completedExams;
    }

    public void setCompletedExams(long completedExams) {
        this.completedExams = completedExams;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public long getPassedExams() {
        return passedExams;
    }

    public void setPassedExams(long passedExams) {
        this.passedExams = passedExams;
    }

    public List<ExamResponseDto> getUpcomingExams() {
        return upcomingExams;
    }

    public void setUpcomingExams(List<ExamResponseDto> upcomingExams) {
        this.upcomingExams = upcomingExams;
    }

    public List<ExamResultDto> getRecentResults() {
        return recentResults;
    }

    public void setRecentResults(List<ExamResultDto> recentResults) {
        this.recentResults = recentResults;
    }
}
