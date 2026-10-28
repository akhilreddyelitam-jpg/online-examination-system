package com.onlineexam.dto;

import java.util.ArrayList;
import java.util.List;

public class TeacherStatsDto {
    private long totalExams;
    private long publishedExams;
    private long totalSubmissions;
    private Double averageScore;
    private List<ExamResponseDto> myExams = new ArrayList<>();
    private List<ExamResultDto> recentSubmissions = new ArrayList<>();

    public TeacherStatsDto() {}

    public long getTotalExams() {
        return totalExams;
    }

    public void setTotalExams(long totalExams) {
        this.totalExams = totalExams;
    }

    public long getPublishedExams() {
        return publishedExams;
    }

    public void setPublishedExams(long publishedExams) {
        this.publishedExams = publishedExams;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(long totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public List<ExamResponseDto> getMyExams() {
        return myExams;
    }

    public void setMyExams(List<ExamResponseDto> myExams) {
        this.myExams = myExams;
    }

    public List<ExamResultDto> getRecentSubmissions() {
        return recentSubmissions;
    }

    public void setRecentSubmissions(List<ExamResultDto> recentSubmissions) {
        this.recentSubmissions = recentSubmissions;
    }
}
