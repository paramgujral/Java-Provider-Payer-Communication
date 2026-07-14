package com.healthcare.payer.controller;

import com.healthcare.payer.entity.Payer;
import com.healthcare.payer.service.PayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/payer")
@RequiredArgsConstructor
public class PayerController {
    private final PayerService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('PAYER','ADMIN')")
    public Payer create(@Valid @RequestBody Payer payer) {
        return service.create(payer);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public Payer getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN')")
    public List<Payer> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN')")
    public Payer update(@PathVariable Long id, @Valid @RequestBody Payer payer) {
        return service.update(id, payer);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Payer deleted successfully";
    }
}
