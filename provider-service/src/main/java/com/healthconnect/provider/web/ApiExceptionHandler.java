package com.healthconnect.provider.web;

import com.healthconnect.provider.service.AuthorizationRequestService;
import com.healthconnect.provider.service.PayerClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(AuthorizationRequestService.NotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(AuthorizationRequestService.NotFoundException e) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(AuthorizationRequestService.InvalidStateException.class)
    public ResponseEntity<Map<String, Object>> invalidState(AuthorizationRequestService.InvalidStateException e) {
        return error(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(PayerClient.PayerUnavailableException.class)
    public ResponseEntity<Map<String, Object>> payerDown(PayerClient.PayerUnavailableException e) {
        return error(HttpStatus.BAD_GATEWAY, e.getMessage());
    }

    /** 422 with the copilot report in the body. */
    @ExceptionHandler(AuthorizationRequestService.CopilotBlockedException.class)
    public ResponseEntity<Map<String, Object>> copilotBlocked(AuthorizationRequestService.CopilotBlockedException e) {
        return ResponseEntity.unprocessableEntity().body(Map.of(
                "error", e.getMessage(),
                "copilotReport", e.getReport()));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
