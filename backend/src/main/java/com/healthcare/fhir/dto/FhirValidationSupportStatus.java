package com.healthcare.fhir.dto;

import java.util.ArrayList;
import java.util.List;

public class FhirValidationSupportStatus {
    private boolean configured;
    private String remoteBaseUrl;
    private List<String> messages = new ArrayList<>();
    private List<String> loadedDefinitions = new ArrayList<>();

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public String getRemoteBaseUrl() {
        return remoteBaseUrl;
    }

    public void setRemoteBaseUrl(String remoteBaseUrl) {
        this.remoteBaseUrl = remoteBaseUrl;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }

    public List<String> getLoadedDefinitions() {
        return loadedDefinitions;
    }

    public void setLoadedDefinitions(List<String> loadedDefinitions) {
        this.loadedDefinitions = loadedDefinitions;
    }
}
