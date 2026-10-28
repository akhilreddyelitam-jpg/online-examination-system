package com.onlineexam.service;

import com.onlineexam.dto.ExamResultDto;
import com.onlineexam.dto.OptionDto;
import com.onlineexam.dto.QuestionReviewDto;
import com.onlineexam.dto.ResultDetailDto;
import com.onlineexam.entity.*;
import com.onlineexam.exception.ResourceNotFoundException;
import com.onlineexam.exception.UnauthorizedException;
import com.onlineexam.repository.ExamResultRepository;
import com.onlineexam.repository.StudentResponseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResultService {

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private StudentResponseRepository studentResponseRepository;

    @Autowired
    private ExamService examService;

    public List<ExamResultDto> getMyResults(User student) {
        return examResultRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(ExamResultDto::new)
                .collect(Collectors.toList());
    }

    public List<ExamResultDto> getResultsByExamId(Long examId, User requester) {
        Exam exam = examService.getExamEntity(examId);
        examService.checkExamPermission(exam, requester);

        return examResultRepository.findByExamIdOrderByCreatedAtDesc(examId).stream()
                .map(ExamResultDto::new)
                .collect(Collectors.toList());
    }

    public ResultDetailDto getResultByAttemptId(Long attemptId, User requester) {
        ExamResult result = examResultRepository.findByAttemptId(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found for attempt id: " + attemptId));

        boolean isAdmin = requester.getRole().getName() == ERole.ROLE_ADMIN;
        boolean isTeacher = requester.getRole().getName() == ERole.ROLE_TEACHER;
        boolean isStudentOwner = result.getStudent().getId().equals(requester.getId());

        if (!isAdmin && !isTeacher && !isStudentOwner) {
            throw new UnauthorizedException("You are not authorized to view this result.");
        }

        ExamAttempt attempt = result.getAttempt();
        Exam exam = result.getExam();
        List<Question> questions = exam.getQuestions();

        List<StudentResponse> responses = studentResponseRepository.findByAttemptId(attemptId);
        Map<Long, StudentResponse> responseMap = responses.stream()
                .collect(Collectors.toMap(r -> r.getQuestion().getId(), r -> r, (r1, r2) -> r2));

        List<QuestionReviewDto> reviewDtos = new ArrayList<>();

        for (Question q : questions) {
            QuestionReviewDto review = new QuestionReviewDto();
            review.setQuestionId(q.getId());
            review.setQuestionText(q.getQuestionText());
            review.setQuestionType(q.getQuestionType());
            review.setMarks(q.getMarks());
            review.setNegativeMarks(q.getNegativeMarks());
            review.setExplanation(q.getExplanation());

            List<OptionDto> optDtos = q.getOptions().stream()
                    .map(o -> new OptionDto(o.getId(), o.getOptionText(), o.isCorrect()))
                    .collect(Collectors.toList());
            review.setOptions(optDtos);

            Option correctOpt = q.getOptions().stream()
                    .filter(Option::isCorrect)
                    .findFirst()
                    .orElse(null);
            if (correctOpt != null) {
                review.setCorrectOptionId(correctOpt.getId());
            }

            StudentResponse resp = responseMap.get(q.getId());
            if (resp != null && resp.getSelectedOptionId() != null) {
                review.setAnswered(true);
                review.setSelectedOptionId(resp.getSelectedOptionId());
                boolean isCorrect = correctOpt != null && correctOpt.getId().equals(resp.getSelectedOptionId());
                review.setCorrect(isCorrect);
            } else {
                review.setAnswered(false);
                review.setSelectedOptionId(null);
                review.setCorrect(false);
            }

            reviewDtos.add(review);
        }

        return new ResultDetailDto(new ExamResultDto(result), reviewDtos);
    }
}
