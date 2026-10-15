package com.onlineexam.dto;

import java.util.ArrayList;
import java.util.List;

public class AdminStatsDto {
    private long totalStudents;
    private long totalTeachers;
    private long totalExams;
    private long totalSubmissions;
    private long totalPassed;
    private Double averageScore;
    private List<ExamResponseDto> recentExams = new ArrayList<>();
    private List<ExamResultDto> recentResults = new ArrayList<>();

    public AdminStatsDto() {}

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public void setTotalTeachers(long totalTeachers) {
        this.totalTeachers = totalTeachers;
    }

    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(long totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public long getTotalPassed() {
        return totalPassed;
    }

    public void setTotalPassed(long totalPassed) {
        this.totalPassed = totalPassed;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public List<ExamResponseDto> getRecentExams() {
        return recentExams;
    }

    public void setRecentExams(List<ExamResponseDto> recentExams) {
        this.recentExams = recentExams;
    }

    public List<ExamResultDto> getRecentResults() {
        return recentResults;
    }

    public void setRecentResults(List<ExamResultDto> recentResults) {
        this.recentResults = recentResults;
    }
}
