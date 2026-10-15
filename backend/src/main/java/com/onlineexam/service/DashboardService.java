package com.onlineexam.service;

import com.onlineexam.dto.*;
import com.onlineexam.entity.ERole;
import com.onlineexam.entity.Exam;
import com.onlineexam.entity.ExamResult;
import com.onlineexam.entity.User;
import com.onlineexam.repository.ExamAttemptRepository;
import com.onlineexam.repository.ExamRepository;
import com.onlineexam.repository.ExamResultRepository;
import com.onlineexam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    public AdminStatsDto getAdminStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalStudents(userRepository.countByRoleName(ERole.ROLE_STUDENT));
        stats.setTotalTeachers(userRepository.countByRoleName(ERole.ROLE_TEACHER));
        stats.setTotalExams(examRepository.count());
        stats.setTotalSubmissions(examResultRepository.countTotalSubmissions());
        stats.setTotalPassed(examResultRepository.countPassed());

        Double avg = examResultRepository.getOverallAverageScore();
        stats.setAverageScore(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);

        List<ExamResponseDto> recentExams = examRepository.findAllOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(ExamResponseDto::new)
                .collect(Collectors.toList());
        stats.setRecentExams(recentExams);

        List<ExamResultDto> recentResults = examResultRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(ExamResultDto::new)
                .collect(Collectors.toList());
        stats.setRecentResults(recentResults);

        return stats;
    }

    public TeacherStatsDto getTeacherStats(User teacher) {
        TeacherStatsDto stats = new TeacherStatsDto();
        List<Exam> teacherExams = examRepository.findByCreatedById(teacher.getId());
        stats.setTotalExams(teacherExams.size());

        long pubCount = teacherExams.stream().filter(Exam::isPublished).count();
        stats.setPublishedExams(pubCount);

        List<Long> examIds = teacherExams.stream().map(Exam::getId).collect(Collectors.toList());
        List<ExamResult> teacherResults = examResultRepository.findAll().stream()
                .filter(r -> examIds.contains(r.getExam().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        stats.setTotalSubmissions(teacherResults.size());

        double avgScore = teacherResults.stream()
                .mapToDouble(ExamResult::getPercentage)
                .average()
                .orElse(0.0);
        stats.setAverageScore(Math.round(avgScore * 10.0) / 10.0);

        stats.setMyExams(teacherExams.stream().limit(5).map(ExamResponseDto::new).collect(Collectors.toList()));
        stats.setRecentSubmissions(teacherResults.stream().limit(5).map(ExamResultDto::new).collect(Collectors.toList()));

        return stats;
    }

    public StudentStatsDto getStudentStats(User student) {
        StudentStatsDto stats = new StudentStatsDto();
        List<Exam> published = examRepository.findByPublishedTrue();
        List<ExamResult> myResults = examResultRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());

        List<Long> attemptedExamIds = myResults.stream().map(r -> r.getExam().getId()).collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        List<Exam> available = published.stream()
                .filter(e -> !attemptedExamIds.contains(e.getId()))
                .collect(Collectors.toList());

        stats.setAvailableExams(available.size());
        stats.setCompletedExams(myResults.size());

        long passedCount = myResults.stream().filter(ExamResult::isPassed).count();
        stats.setPassedExams(passedCount);

        double avgScore = myResults.stream()
                .mapToDouble(ExamResult::getPercentage)
                .average()
                .orElse(0.0);
        stats.setAverageScore(Math.round(avgScore * 10.0) / 10.0);

        stats.setUpcomingExams(available.stream().limit(5).map(ExamResponseDto::new).collect(Collectors.toList()));
        stats.setRecentResults(myResults.stream().limit(5).map(ExamResultDto::new).collect(Collectors.toList()));

        return stats;
    }
}
