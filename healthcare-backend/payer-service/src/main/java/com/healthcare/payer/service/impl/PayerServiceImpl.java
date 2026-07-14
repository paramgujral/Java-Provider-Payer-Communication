package com.healthcare.payer.service.impl;

import com.healthcare.payer.entity.Payer;
import com.healthcare.payer.exception.ResourceNotFoundException;
import com.healthcare.payer.repository.PayerRepository;
import com.healthcare.payer.service.PayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayerServiceImpl implements PayerService {
    private final PayerRepository repository;

    public Payer create(Payer payer) {
        return repository.save(payer);
    }

    public Payer getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Payer not found: " + id));
    }

    public List<Payer> getAll() {
        return repository.findAll();
    }

    public Payer update(Long id, Payer payer) {
        Payer existing = getById(id);
        existing.setPayerName(payer.getPayerName());
        existing.setPayerCode(payer.getPayerCode());
        existing.setEmail(payer.getEmail());
        existing.setPhone(payer.getPhone());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }
}
