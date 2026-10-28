package com.onlineexam.service;

import com.onlineexam.dto.OptionDto;
import com.onlineexam.dto.QuestionRequestDto;
import com.onlineexam.dto.QuestionResponseDto;
import com.onlineexam.dto.QuestionStudentDto;
import com.onlineexam.entity.*;
import com.onlineexam.exception.BadRequestException;
import com.onlineexam.exception.ResourceNotFoundException;
import com.onlineexam.repository.ExamRepository;
import com.onlineexam.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamService examService;

    public List<QuestionResponseDto> getQuestionsByExamId(Long examId) {
        return questionRepository.findByExamId(examId).stream()
                .map(QuestionResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<QuestionStudentDto> getQuestionsForStudent(Long examId) {
        return questionRepository.findByExamId(examId).stream()
                .map(QuestionStudentDto::new)
                .collect(Collectors.toList());
    }

    public QuestionResponseDto getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return new QuestionResponseDto(question);
    }

    @Transactional
    public QuestionResponseDto addQuestionToExam(Long examId, QuestionRequestDto dto, User user) {
        Exam exam = examService.getExamEntity(examId);
        examService.checkExamPermission(exam, user);

        validateQuestionDto(dto);

        Question question = new Question();
        question.setExam(exam);
        question.setQuestionText(dto.getQuestionText());
        question.setQuestionType(dto.getQuestionType());
        question.setMarks(dto.getMarks() != null ? dto.getMarks() : 1.0);
        question.setNegativeMarks(dto.getNegativeMarks() != null ? dto.getNegativeMarks() : 0.0);
        question.setExplanation(dto.getExplanation());

        List<Option> options = new ArrayList<>();
        if (dto.getOptions() != null) {
            for (OptionDto optDto : dto.getOptions()) {
                Option opt = new Option(optDto.getOptionText(), optDto.isCorrect());
                opt.setQuestion(question);
                options.add(opt);
            }
        }
        question.setOptions(options);

        Question saved = questionRepository.save(question);
        return new QuestionResponseDto(saved);
    }

    @Transactional
    public QuestionResponseDto updateQuestion(Long id, QuestionRequestDto dto, User user) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        examService.checkExamPermission(question.getExam(), user);

        validateQuestionDto(dto);

        question.setQuestionText(dto.getQuestionText());
        question.setQuestionType(dto.getQuestionType());
        question.setMarks(dto.getMarks() != null ? dto.getMarks() : 1.0);
        question.setNegativeMarks(dto.getNegativeMarks() != null ? dto.getNegativeMarks() : 0.0);
        question.setExplanation(dto.getExplanation());

        // Update options
        question.getOptions().clear();
        if (dto.getOptions() != null) {
            for (OptionDto optDto : dto.getOptions()) {
                Option opt = new Option(optDto.getOptionText(), optDto.isCorrect());
                opt.setQuestion(question);
                question.getOptions().add(opt);
            }
        }

        Question updated = questionRepository.save(question);
        return new QuestionResponseDto(updated);
    }

    @Transactional
    public void deleteQuestion(Long id, User user) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        examService.checkExamPermission(question.getExam(), user);
        questionRepository.delete(question);
    }

    private void validateQuestionDto(QuestionRequestDto dto) {
        if (dto.getOptions() == null || dto.getOptions().isEmpty()) {
            throw new BadRequestException("Question must have at least two answer options.");
        }
        boolean hasCorrectOption = dto.getOptions().stream().anyMatch(OptionDto::isCorrect);
        if (!hasCorrectOption) {
            throw new BadRequestException("At least one option must be marked as correct.");
        }
    }
}
