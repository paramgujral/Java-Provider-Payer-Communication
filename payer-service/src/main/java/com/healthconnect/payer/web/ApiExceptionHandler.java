package com.healthconnect.payer.web;

import com.healthconnect.payer.service.CaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(CaseService.NotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(CaseService.NotFoundException e) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(CaseService.InvalidStateException.class)
    public ResponseEntity<Map<String, Object>> invalidState(CaseService.InvalidStateException e) {
        return error(HttpStatus.CONFLICT, e.getMessage());
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
