package com.onlineexam.service;

import com.onlineexam.entity.*;
import com.onlineexam.repository.ExamResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    @Autowired
    private ExamResultRepository examResultRepository;

    @Transactional
    public ExamResult evaluateAttempt(ExamAttempt attempt) {
        Exam exam = attempt.getExam();
        List<Question> questions = exam.getQuestions();
        List<StudentResponse> responses = attempt.getResponses();

        Map<Long, StudentResponse> responseMap = responses.stream()
                .filter(r -> r.getQuestion() != null)
                .collect(Collectors.toMap(r -> r.getQuestion().getId(), r -> r, (r1, r2) -> r2));

        int totalQuestions = questions.size();
        int answeredQuestions = 0;
        int correctAnswers = 0;
        int wrongAnswers = 0;
        int unansweredQuestions = 0;
        double marksObtained = 0.0;
        double calculatedTotalMarks = 0.0;

        for (Question question : questions) {
            double qMarks = question.getMarks() != null ? question.getMarks() : 1.0;
            calculatedTotalMarks += qMarks;

            StudentResponse response = responseMap.get(question.getId());
            Long selectedOptionId = (response != null) ? response.getSelectedOptionId() : null;

            if (selectedOptionId != null) {
                answeredQuestions++;

                // Find if the selected option is correct
                boolean isCorrect = question.getOptions().stream()
                        .anyMatch(opt -> opt.getId().equals(selectedOptionId) && opt.isCorrect());

                if (isCorrect) {
                    correctAnswers++;
                    marksObtained += qMarks;
                } else {
                    wrongAnswers++;
                    if (exam.isNegativeMarkingEnabled()) {
                        double neg = (question.getNegativeMarks() != null && question.getNegativeMarks() > 0)
                                ? question.getNegativeMarks()
                                : (exam.getDefaultNegativeMarks() != null ? exam.getDefaultNegativeMarks() : 0.0);
                        marksObtained -= neg;
                    }
                }
            } else {
                unansweredQuestions++;
            }
        }

        // Clamp marks to 0 minimum
        if (marksObtained < 0.0) {
            marksObtained = 0.0;
        }

        double totalMarksConfigured = (exam.getTotalMarks() != null && exam.getTotalMarks() > 0)
                ? exam.getTotalMarks()
                : (calculatedTotalMarks > 0 ? calculatedTotalMarks : 1.0);

        // Percentage = (Marks Obtained / Total Marks) * 100
        double percentage = (totalMarksConfigured > 0) ? (marksObtained / totalMarksConfigured) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0; // 2 decimal precision

        double passPercent = (exam.getPassingPercentage() != null) ? exam.getPassingPercentage() : 40.0;
        boolean passed = percentage >= passPercent;

        // Save or update ExamResult
        ExamResult result = examResultRepository.findByAttemptId(attempt.getId())
                .orElse(new ExamResult());

        result.setAttempt(attempt);
        result.setExam(exam);
        result.setStudent(attempt.getStudent());
        result.setTotalQuestions(totalQuestions);
        result.setAnsweredQuestions(answeredQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setWrongAnswers(wrongAnswers);
        result.setUnansweredQuestions(unansweredQuestions);
        result.setMarksObtained(marksObtained);
        result.setTotalMarks(totalMarksConfigured);
        result.setPercentage(percentage);
        result.setPassed(passed);
        result.setReleased(true);
        result.setViolationCount(attempt.getViolationCount());
        result.setCreatedAt(LocalDateTime.now());

        // Update attempt status and scores
        attempt.setScoreObtained(marksObtained);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);

        return examResultRepository.save(result);
    }
}
