package com.healthcare.service;

/**
 * Service for sending email notifications.
 */
public interface EmailService {

    /**
     * Sends a simple text email.
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param body    email body (plain text or HTML)
     */
    void sendEmail(String to, String subject, String body);
}
