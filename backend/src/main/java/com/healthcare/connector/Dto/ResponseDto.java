package com.healthcare.connector.Dto;

import com.healthcare.connector.enums.ResponseStatus;

public class ResponseDto {
    private ResponseStatus status;
    private String notes;

    // Getters and setters
    public ResponseStatus getStatus() { return status; }
    public void setStatus(ResponseStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
