package com.healthcare.connector.repositories;

import com.healthcare.connector.models.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderRepository extends JpaRepository<Provider, Long> {
}
