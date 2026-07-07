package com.healthconnect.payer.web;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.payer.domain.CaseHistory;
import com.healthconnect.payer.domain.PriorAuthCase;
import com.healthconnect.payer.service.CaseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    public record DecisionDto(CaseService.ReviewAction action, String note) {
    }

    public record CaseDetailDto(PriorAuthCase authCase, List<CaseHistory> history) {
    }

    private final CaseService service;

    public CaseController(CaseService service) {
        this.service = service;
    }

    @GetMapping
    public List<PriorAuthCase> list(@RequestParam(required = false) AuthorizationStatus status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public CaseDetailDto detail(@PathVariable Long id) {
        return new CaseDetailDto(service.get(id), service.historyOf(id));
    }

    /** Records a decision on the case. */
    @PostMapping("/{id}/decision")
    public PriorAuthCase decide(@PathVariable Long id, @RequestBody DecisionDto decision) {
        return service.decide(id, decision.action(), decision.note());
    }
}
