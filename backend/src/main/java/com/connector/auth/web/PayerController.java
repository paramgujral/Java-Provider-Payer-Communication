package com.connector.auth.web;

import com.connector.auth.domain.AuthorizationRequest;
import com.connector.auth.dto.DecisionDto;
import com.connector.auth.service.AuthorizationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Payer module: review the queue and adjudicate requests. */
@RestController
@RequestMapping("/api/payer")
public class PayerController {

    private final AuthorizationService service;

    public PayerController(AuthorizationService service) { this.service = service; }

    @GetMapping("/queue")
    public List<AuthorizationRequest> queue() {
        return service.payerQueue();
    }

    /** Approve / deny / request-info on a request. */
    @PostMapping("/requests/{id}/decision")
    public AuthorizationRequest decide(@PathVariable Long id, @RequestBody DecisionDto dto) {
        return service.decide(id, dto);
    }
}
