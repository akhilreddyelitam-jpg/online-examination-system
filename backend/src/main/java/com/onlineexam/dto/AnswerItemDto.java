package com.onlineexam.dto;

public class AnswerItemDto {
    private Long questionId;
    private Long selectedOptionId;
    private boolean markedForReview;

    public AnswerItemDto() {}

    public AnswerItemDto(Long questionId, Long selectedOptionId, boolean markedForReview) {
        this.questionId = questionId;
        this.selectedOptionId = selectedOptionId;
        this.markedForReview = markedForReview;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getSelectedOptionId() {
        return selectedOptionId;
    }

    public void setSelectedOptionId(Long selectedOptionId) {
        this.selectedOptionId = selectedOptionId;
    }

    public boolean isMarkedForReview() {
        return markedForReview;
    }

    public void setMarkedForReview(boolean markedForReview) {
        this.markedForReview = markedForReview;
    }
}
