package com.feuji.healthcare.notification.controller;

import com.feuji.healthcare.common.response.ApiResponse;
import com.feuji.healthcare.notification.dto.NotificationResponseDto;
import com.feuji.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROVIDER','PAYER')")
    public ResponseEntity<ApiResponse<List<NotificationResponseDto>>>
    getAllNotifications() {

        return ResponseEntity.ok(
                ApiResponse.<List<NotificationResponseDto>>builder()
                        .success(true)
                        .message("Notifications fetched successfully")
                        .data(notificationService.getAllNotifications())
                        .build()
        );
    }
}
