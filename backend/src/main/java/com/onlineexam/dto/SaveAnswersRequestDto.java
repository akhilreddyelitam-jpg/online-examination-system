package com.onlineexam.dto;

import java.util.ArrayList;
import java.util.List;

public class SaveAnswersRequestDto {
    private List<AnswerItemDto> answers = new ArrayList<>();

    public SaveAnswersRequestDto() {}

    public SaveAnswersRequestDto(List<AnswerItemDto> answers) {
        this.answers = answers;
    }

    public List<AnswerItemDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerItemDto> answers) {
        this.answers = answers;
    }
}
