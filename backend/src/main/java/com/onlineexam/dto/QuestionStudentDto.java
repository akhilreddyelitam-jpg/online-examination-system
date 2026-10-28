package com.onlineexam.dto;

import com.onlineexam.entity.Question;
import com.onlineexam.entity.QuestionType;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class QuestionStudentDto {
    private Long id;
    private String questionText;
    private QuestionType questionType;
    private Double marks;
    private Double negativeMarks;
    private List<OptionStudentDto> options = new ArrayList<>();

    public QuestionStudentDto() {}

    public QuestionStudentDto(Question q) {
        this.id = q.getId();
        this.questionText = q.getQuestionText();
        this.questionType = q.getQuestionType();
        this.marks = q.getMarks();
        this.negativeMarks = q.getNegativeMarks();
        if (q.getOptions() != null) {
            this.options = q.getOptions().stream()
                    .map(o -> new OptionStudentDto(o.getId(), o.getOptionText()))
                    .collect(Collectors.toList());
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<OptionStudentDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionStudentDto> options) {
        this.options = options;
    }
}
