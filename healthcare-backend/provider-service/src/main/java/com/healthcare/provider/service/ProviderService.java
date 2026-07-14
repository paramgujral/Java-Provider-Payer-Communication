package com.healthcare.provider.service;

import com.healthcare.provider.entity.Provider;
import java.util.List;

public interface ProviderService {
    Provider create(Provider provider);
    Provider getById(Long id);
    List<Provider> getAll();
    Provider update(Long id, Provider provider);
    void delete(Long id);
}
