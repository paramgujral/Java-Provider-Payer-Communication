package com.feuji.healthcare_connector.config;

import com.feuji.healthcare_connector.service.CloudinaryService;
import com.feuji.healthcare_connector.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.Map;

@Component
public class ApiCredentialsChecker implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RedisService redisService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Override
    public void run(String... args) {
        System.out.println("\n======================================================================");
        System.out.println("          FEUJI SMART HEALTHCARE CONNECTOR - SYSTEM DIAGNOSTICS         ");
        System.out.println("======================================================================");

        // 1. Test NeonDB
        boolean dbStatus = false;
        String dbDetails = "";
        try {
            String dbVersion = jdbcTemplate.queryForObject("SELECT version();", String.class);
            dbStatus = true;
            dbDetails = "Connected (" + (dbVersion != null && dbVersion.length() > 30 ? dbVersion.substring(0, 30) + "..." : dbVersion) + ")";
        } catch (Exception e) {
            dbDetails = "Failed: " + e.getMessage();
        }
        printStatusRow("NeonDB Database", dbStatus, dbDetails);

        // 2. Test Upstash Redis
        boolean redisStatus = false;
        String redisDetails = "";
        try {
            redisService.set("healthcheck_ping", "pong", 10);
            String val = redisService.get("healthcheck_ping");
            if ("pong".equals(val)) {
                redisStatus = true;
                redisDetails = "Connected & Active";
            } else {
                redisDetails = "Response Mismatch";
            }
        } catch (Exception e) {
            redisDetails = "Failed: " + e.getMessage();
        }
        printStatusRow("Upstash Redis Cache", redisStatus, redisDetails);

        // 3. Test Cloudinary Storage
        boolean cloudinaryStatus = false;
        String cloudinaryDetails = "";
        try {
            final byte[] pixelBytes = Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            MultipartFile mockFile = new MultipartFile() {
                @Override
                public String getName() { return "file"; }
                @Override
                public String getOriginalFilename() { return "healthcheck.gif"; }
                @Override
                public String getContentType() { return "image/gif"; }
                @Override
                public boolean isEmpty() { return false; }
                @Override
                public long getSize() { return pixelBytes.length; }
                @Override
                public byte[] getBytes() { return pixelBytes; }
                @Override
                public InputStream getInputStream() { return new ByteArrayInputStream(pixelBytes); }
                @Override
                public void transferTo(File dest) throws IOException, IllegalStateException {}
            };
            
            String url = cloudinaryService.uploadFile(mockFile);
            if (url != null && url.startsWith("http")) {
                cloudinaryStatus = true;
                cloudinaryDetails = "Connected (Uploaded check ID: " + url.substring(url.lastIndexOf("/") + 1) + ")";
            } else {
                cloudinaryDetails = "Invalid URL returned";
            }
        } catch (Exception e) {
            cloudinaryDetails = "Failed: " + e.getMessage();
        }
        printStatusRow("Cloudinary Storage", cloudinaryStatus, cloudinaryDetails);

        // 4. Test Gemini API
        boolean geminiStatus = false;
        String geminiDetails = "";
        try {
            RestTemplate restTemplate = new RestTemplate();
            String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;
            String requestJson = "{\"contents\": [{\"parts\":[{\"text\": \"hello\"}]}]}";
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestJson, headers);
            
            try {
                restTemplate.postForEntity(fullUrl, entity, String.class);
                geminiStatus = true;
                geminiDetails = "Authenticated Successfully";
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                if (e.getStatusCode().value() == 429) {
                    geminiStatus = true; 
                    geminiDetails = "Authenticated (Rate Limited/Quota Exceeded, but Key is Valid!)";
                } else {
                    geminiDetails = "HTTP " + e.getStatusCode().value() + ": " + e.getResponseBodyAsString();
                }
            }
        } catch (Exception e) {
            geminiDetails = "Failed: " + e.getMessage();
        }
        printStatusRow("Google Gemini AI", geminiStatus, geminiDetails);

        System.out.println("======================================================================\n");
    }

    private void printStatusRow(String serviceName, boolean success, String details) {
        String status = success ? "  [OK]  " : "[FAILED]";
        System.out.printf("%-20s : %s %s\n", serviceName, status, details);
    }
}
