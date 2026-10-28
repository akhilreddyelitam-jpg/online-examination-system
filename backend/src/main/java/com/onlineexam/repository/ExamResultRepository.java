package com.onlineexam.repository;

import com.onlineexam.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    Optional<ExamResult> findByAttemptId(Long attemptId);
    List<ExamResult> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<ExamResult> findByExamIdOrderByCreatedAtDesc(Long examId);

    @Query("SELECT AVG(r.percentage) FROM ExamResult r WHERE r.exam.id = :examId")
    Double getAverageScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT AVG(r.percentage) FROM ExamResult r")
    Double getOverallAverageScore();

    @Query("SELECT COUNT(r) FROM ExamResult r WHERE r.passed = true")
    long countPassed();

    @Query("SELECT COUNT(r) FROM ExamResult r")
    long countTotalSubmissions();
}
