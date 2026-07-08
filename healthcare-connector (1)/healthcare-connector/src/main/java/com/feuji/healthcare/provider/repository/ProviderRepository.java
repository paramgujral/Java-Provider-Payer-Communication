package com.feuji.healthcare.provider.repository;

import com.feuji.healthcare.provider.entity.ProviderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProviderRepository
        extends JpaRepository<ProviderEntity, Long> {

    boolean existsByEmail(String email);

    Optional<ProviderEntity> findByProviderCode(String providerCode);
}
