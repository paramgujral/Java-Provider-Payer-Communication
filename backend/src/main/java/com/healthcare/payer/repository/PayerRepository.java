package com.healthcare.payer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.payer.entity.Payer;

public interface PayerRepository extends JpaRepository<Payer, Long> {
    boolean existsByPayerCode(String payerCode);
    Optional<Payer> findByUserId(Long userId);
    Optional<Payer> findByEmail(String email);
}
