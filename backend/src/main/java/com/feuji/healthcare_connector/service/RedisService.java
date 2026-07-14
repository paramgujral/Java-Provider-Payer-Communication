package com.feuji.healthcare_connector.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class RedisService {

    @Value("${redis.url}")
    private String redisUrl;

    @Value("${redis.token}")
    private String redisToken;

    private final RestTemplate restTemplate = new RestTemplate();

    private Object executeCommand(List<String> command) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + redisToken);

        HttpEntity<List<String>> entity = new HttpEntity<>(command, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(redisUrl, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().get("result");
            }
        } catch (Exception e) {
            System.err.println("Redis command execution failed: " + e.getMessage());
        }
        return null;
    }

    public void set(String key, String value, long ttlSeconds) {
        executeCommand(List.of("SET", key, value, "EX", String.valueOf(ttlSeconds)));
    }

    public String get(String key) {
        Object res = executeCommand(List.of("GET", key));
        return res != null ? res.toString() : null;
    }

    public Long incr(String key) {
        Object res = executeCommand(List.of("INCR", key));
        if (res instanceof Number n) return n.longValue();
        if (res != null) try { return Long.parseLong(res.toString()); } catch (NumberFormatException ignored) {}
        return null;
    }

    public void expire(String key, long ttlSeconds) {
        executeCommand(List.of("EXPIRE", key, String.valueOf(ttlSeconds)));
    }

    public boolean isRateLimited(String key, int maxRequests, long windowSeconds) {
        Long current = incr(key);
        if (current == null) {
            return false; 
        }
        if (current == 1) {
            expire(key, windowSeconds);
        }
        return current > maxRequests;
    }
}
