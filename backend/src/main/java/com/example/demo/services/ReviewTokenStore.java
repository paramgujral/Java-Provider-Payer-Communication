package com.example.demo.services;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReviewTokenStore {

    private final Set<String> validTokens =
            ConcurrentHashMap.newKeySet();

    public void add(String token) {
        validTokens.add(token);
    }

    public boolean isValid(String token) {
        return validTokens.contains(token);
    }

    public void consume(String token) {
        validTokens.remove(token);
    }
}
