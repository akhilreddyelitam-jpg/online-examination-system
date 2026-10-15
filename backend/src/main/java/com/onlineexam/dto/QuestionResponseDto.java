package com.onlineexam.dto;

import com.onlineexam.entity.Question;
import com.onlineexam.entity.QuestionType;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class QuestionResponseDto {
    private Long id;
    private Long examId;
    private String questionText;
    private QuestionType questionType;
    private Double marks;
    private Double negativeMarks;
    private String explanation;
    private List<OptionDto> options = new ArrayList<>();

    public QuestionResponseDto() {}

    public QuestionResponseDto(Question q) {
        this.id = q.getId();
        if (q.getExam() != null) {
            this.examId = q.getExam().getId();
        }
        this.questionText = q.getQuestionText();
        this.questionType = q.getQuestionType();
        this.marks = q.getMarks();
        this.negativeMarks = q.getNegativeMarks();
        this.explanation = q.getExplanation();
        if (q.getOptions() != null) {
            this.options = q.getOptions().stream()
                    .map(o -> new OptionDto(o.getId(), o.getOptionText(), o.isCorrect()))
                    .collect(Collectors.toList());
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Double getMarks() {
        return marks;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public Double getNegativeMarks() {
        return negativeMarks;
    }

    public void setNegativeMarks(Double negativeMarks) {
        this.negativeMarks = negativeMarks;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }
}
