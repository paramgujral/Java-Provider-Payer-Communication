package com.healthcare.provider.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.healthcare.provider.entity.Provider;

public interface ProviderRepository extends JpaRepository<Provider, Long> {
    boolean existsByProviderCode(String providerCode);
    Optional<Provider> findByUserId(Long userId);
    Optional<Provider> findByEmail(String email);
}
