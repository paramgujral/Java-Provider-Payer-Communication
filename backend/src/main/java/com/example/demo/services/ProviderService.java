package com.example.demo.services;

import com.example.demo.model.Provider;
import com.example.demo.repository.ProviderRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;


    public List<Provider> getAllProviders() {

        return providerRepository.findAll();
    }


}
