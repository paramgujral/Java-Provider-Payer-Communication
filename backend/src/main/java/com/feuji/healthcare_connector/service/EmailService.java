package com.feuji.healthcare_connector.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@feuji.com}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Verify Your Email - Feuji Smart Healthcare Connector";
        String htmlContent = buildEmailTemplate(
                "Verify Your Email",
                "Thank you for registering with Feuji Smart Healthcare Connector. Please use the following 6-digit One-Time Password (OTP) to activate your account. This code is valid for 10 minutes.",
                "<div style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #f3752e; text-align: center; margin: 20px 0;'>" + otp + "</div>"
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String subject = "Reset Your Password - Feuji Smart Healthcare Connector";
        String htmlContent = buildEmailTemplate(
                "Reset Your Password",
                "We received a request to reset your password. Click the button below to set a new password. This link is valid for 30 minutes.",
                "<div style='text-align: center; margin: 30px 0;'>" +
                "  <a href='" + resetLink + "' style='background-color: #f3752e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Reset Password</a>" +
                "</div>"
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String title, String body, String requestUrl) {
        String actionButton = "";
        if (requestUrl != null && !requestUrl.isEmpty()) {
            actionButton = "<div style='text-align: center; margin: 30px 0;'>" +
                    "  <a href='" + requestUrl + "' style='background-color: #f3752e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(243, 117, 46, 0.15);'>View Request Details</a>" +
                    "</div>";
        }
        String htmlContent = buildEmailTemplate(
                title,
                body,
                actionButton
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        if (mailSender == null) {
            System.err.println("JavaMailSender bean not configured. Printing email to logs:");
            System.err.println("To: " + toEmail);
            System.err.println("Subject: " + subject);
            System.err.println("Content: " + htmlContent);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + " due to error: " + e.getMessage());
        }
    }

    private String buildEmailTemplate(String title, String bodyText, String customHtml) {
        return "<div style=\"margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;\">" +
                "  <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #f4f6f8; padding: 40px 10px;\">" +
                "    <tr>" +
                "      <td align=\"center\">" +
                "        <table width=\"100%\" style=\"max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">" +
                "          <!-- Header (Black background with Orange border-bottom) -->" +
                "          <tr>" +
                "            <td style=\"background-color: #0b1329; padding: 30px 40px; text-align: center; border-bottom: 4px solid #f3752e;\">" +
                "              <img src=\"https://res.cloudinary.com/dgdr3vwoy/image/upload/v1782504870/feuji_logo_branded.png\" alt=\"Feuji Logo\" style=\"height: 48px; display: block; margin: 0 auto;\" />" +
                "              <div style=\"color: #cbd5e1; font-size: 13px; margin-top: 10px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;\">Smart Healthcare Connector</div>" +
                "            </td>" +
                "          </tr>" +
                "          <!-- Body -->" +
                "          <tr>" +
                "            <td style=\"padding: 45px 40px 35px 40px; background-color: #ffffff;\">" +
                "              <h2 style=\"color: #0b1329; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;\">" + title + "</h2>" +
                "              <p style=\"color: #475569; font-size: 16px; line-height: 1.7; margin-bottom: 25px;\">" + bodyText + "</p>" +
                "              " + customHtml + "" +
                "            </td>" +
                "          </tr>" +
                "          <!-- Corporate Values Banner (Orange background, black text) -->" +
                "          <tr>" +
                "            <td style=\"background-color: #f3752e; padding: 15px 20px; text-align: center;\">" +
                "              <div style=\"color: #0b1329; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;\">" +
                "                Wow the customer &bull; Simpler is better &bull; Walk the talk &bull; Spread the cheer &bull; Pay it forward" +
                "              </div>" +
                "            </td>" +
                "          </tr>" +
                "          <!-- Footer (Black background with grey text) -->" +
                "          <tr>" +
                "            <td style=\"background-color: #0b1329; padding: 35px 40px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;\">" +
                "              <p style=\"margin: 0 0 10px 0; color: #f8fafc; font-weight: 600;\">Need assistance? Contact our support desk:</p>" +
                "              <p style=\"margin: 0 0 15px 0;\">" +
                "                Email: <a href=\"mailto:support@Avinash.feuji.com\" style=\"color: #f3752e; text-decoration: none; font-weight: 600;\">support@Avinash.feuji.com</a> | " +
                "                Web: <a href=\"https://www.feuji.com\" style=\"color: #f3752e; text-decoration: none; font-weight: 600;\" target=\"_blank\">feuji.com</a> / <a href=\"https://www.feuji.ai\" style=\"color: #f3752e; text-decoration: none; font-weight: 600;\" target=\"_blank\">feuji.ai</a>" +
                "              </p>" +
                "              <div style=\"border-top: 1px solid #1e293b; padding-top: 15px; font-size: 11px; color: #64748b;\">" +
                "                <p style=\"margin: 0 0 5px 0;\">Feuji Inc. &bull; Hetero Wing, Commerzone, Level 16, Hyderabad Knowledge City, Hyderabad, Telangana – 500081</p>" +
                "                <p style=\"margin: 0;\">This is an automated operational notification. Please do not reply directly to this email.</p>" +
                "              </div>" +
                "            </td>" +
                "          </tr>" +
                "        </table>" +
                "      </td>" +
                "    </tr>" +
                "  </table>" +
                "</div>";
    }
}
