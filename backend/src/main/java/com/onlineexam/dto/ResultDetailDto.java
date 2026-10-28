package com.onlineexam.dto;

import java.util.ArrayList;
import java.util.List;

public class ResultDetailDto {
    private ExamResultDto result;
    private List<QuestionReviewDto> questions = new ArrayList<>();

    public ResultDetailDto() {}

    public ResultDetailDto(ExamResultDto result, List<QuestionReviewDto> questions) {
        this.result = result;
        this.questions = questions;
    }

    public ExamResultDto getResult() {
        return result;
    }

    public void setResult(ExamResultDto result) {
        this.result = result;
    }

    public List<QuestionReviewDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionReviewDto> questions) {
        this.questions = questions;
    }
}
