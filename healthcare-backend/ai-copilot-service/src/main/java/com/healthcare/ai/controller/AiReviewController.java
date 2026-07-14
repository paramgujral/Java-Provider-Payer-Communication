package com.healthcare.ai.controller;

import com.healthcare.ai.entity.AiReview;
import com.healthcare.ai.service.AiReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiReviewController {
    private final AiReviewService service;

    @PostMapping("/review")
    @PreAuthorize("hasAnyRole('PROVIDER','ADMIN')")
    public AiReview review(@RequestBody Map<String, String> request) {
        return service.review(request);
    }

    @GetMapping("/review/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public AiReview getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
