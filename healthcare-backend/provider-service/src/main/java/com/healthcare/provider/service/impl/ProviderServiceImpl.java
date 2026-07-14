package com.healthcare.provider.service.impl;

import com.healthcare.provider.entity.Provider;
import com.healthcare.provider.exception.ResourceNotFoundException;
import com.healthcare.provider.repository.ProviderRepository;
import com.healthcare.provider.service.ProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {
    private final ProviderRepository repository;

    public Provider create(Provider provider) {
        return repository.save(provider);
    }

    public Provider getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + id));
    }

    public List<Provider> getAll() {
        return repository.findAll();
    }

    public Provider update(Long id, Provider provider) {
        Provider existing = getById(id);
        existing.setProviderName(provider.getProviderName());
        existing.setNpiNumber(provider.getNpiNumber());
        existing.setEmail(provider.getEmail());
        existing.setPhone(provider.getPhone());
        existing.setAddress(provider.getAddress());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }
}
