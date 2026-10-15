package com.onlineexam.repository;

import com.onlineexam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByPublishedTrue();
    List<Exam> findByCreatedById(Long userId);
    long countByPublishedTrue();

    @Query("SELECT e FROM Exam e ORDER BY e.createdAt DESC")
    List<Exam> findAllOrderByCreatedAtDesc();
}
