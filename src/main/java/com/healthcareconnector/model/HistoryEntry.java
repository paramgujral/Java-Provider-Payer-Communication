package com.healthcareconnector.model;

public class HistoryEntry {
    private String status;
    private String note;
    private String timestamp;

    public HistoryEntry() {}

    public HistoryEntry(String status, String note, String timestamp) {
        this.status = status;
        this.note = note;
        this.timestamp = timestamp;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
