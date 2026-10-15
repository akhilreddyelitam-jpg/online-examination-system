package com.onlineexam.dto;

public class OptionStudentDto {
    private Long id;
    private String optionText;

    public OptionStudentDto() {}

    public OptionStudentDto(Long id, String optionText) {
        this.id = id;
        this.optionText = optionText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }
}
