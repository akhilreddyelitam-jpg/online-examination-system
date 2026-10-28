package com.onlineexam.service;

import com.onlineexam.dto.ExamRequestDto;
import com.onlineexam.dto.ExamResponseDto;
import com.onlineexam.entity.ERole;
import com.onlineexam.entity.Exam;
import com.onlineexam.entity.User;
import com.onlineexam.exception.ResourceNotFoundException;
import com.onlineexam.exception.UnauthorizedException;
import com.onlineexam.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    public List<ExamResponseDto> getAllExams() {
        return examRepository.findAllOrderByCreatedAtDesc().stream()
                .map(ExamResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<ExamResponseDto> getPublishedExams() {
        return examRepository.findByPublishedTrue().stream()
                .map(ExamResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<ExamResponseDto> getExamsByCreator(Long creatorId) {
        return examRepository.findByCreatedById(creatorId).stream()
                .map(ExamResponseDto::new)
                .collect(Collectors.toList());
    }

    public ExamResponseDto getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return new ExamResponseDto(exam);
    }

    public Exam getExamEntity(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
    }

    @Transactional
    public ExamResponseDto createExam(ExamRequestDto dto, User creator) {
        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setSubject(dto.getSubject());
        exam.setDescription(dto.getDescription());
        exam.setDurationMinutes(dto.getDurationMinutes());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setPassingPercentage(dto.getPassingPercentage());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setPublished(dto.isPublished());
        exam.setNegativeMarkingEnabled(dto.isNegativeMarkingEnabled());
        exam.setDefaultNegativeMarks(dto.getDefaultNegativeMarks());
        exam.setSafeExamBrowserEnabled(dto.isSafeExamBrowserEnabled());
        exam.setCreatedBy(creator);

        Exam saved = examRepository.save(exam);
        return new ExamResponseDto(saved);
    }

    @Transactional
    public ExamResponseDto updateExam(Long id, ExamRequestDto dto, User user) {
        Exam exam = getExamEntity(id);
        checkExamPermission(exam, user);

        exam.setTitle(dto.getTitle());
        exam.setSubject(dto.getSubject());
        exam.setDescription(dto.getDescription());
        exam.setDurationMinutes(dto.getDurationMinutes());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setPassingPercentage(dto.getPassingPercentage());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setPublished(dto.isPublished());
        exam.setNegativeMarkingEnabled(dto.isNegativeMarkingEnabled());
        exam.setDefaultNegativeMarks(dto.getDefaultNegativeMarks());
        exam.setSafeExamBrowserEnabled(dto.isSafeExamBrowserEnabled());

        Exam updated = examRepository.save(exam);
        return new ExamResponseDto(updated);
    }

    @Transactional
    public ExamResponseDto togglePublishExam(Long id, User user) {
        Exam exam = getExamEntity(id);
        checkExamPermission(exam, user);

        exam.setPublished(!exam.isPublished());
        Exam updated = examRepository.save(exam);
        return new ExamResponseDto(updated);
    }

    @Transactional
    public void deleteExam(Long id, User user) {
        Exam exam = getExamEntity(id);
        checkExamPermission(exam, user);
        examRepository.delete(exam);
    }

    public void checkExamPermission(Exam exam, User user) {
        boolean isAdmin = user.getRole().getName() == ERole.ROLE_ADMIN;
        boolean isCreator = exam.getCreatedBy() != null && exam.getCreatedBy().getId().equals(user.getId());
        if (!isAdmin && !isCreator) {
            throw new UnauthorizedException("You do not have permission to modify this examination.");
        }
    }
}
