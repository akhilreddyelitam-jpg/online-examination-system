package com.onlineexam.repository;

import com.onlineexam.entity.StudentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentResponseRepository extends JpaRepository<StudentResponse, Long> {
    Optional<StudentResponse> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    List<StudentResponse> findByAttemptId(Long attemptId);
    void deleteByAttemptId(Long attemptId);
}
