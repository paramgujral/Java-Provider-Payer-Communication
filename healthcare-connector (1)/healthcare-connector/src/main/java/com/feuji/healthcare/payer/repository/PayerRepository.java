package com.feuji.healthcare.payer.repository;

import com.feuji.healthcare.payer.entity.PayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PayerRepository
        extends JpaRepository<PayerEntity, Long> {

    boolean existsByEmail(String email);

    Optional<PayerEntity> findByPayerCode(String payerCode);
}
