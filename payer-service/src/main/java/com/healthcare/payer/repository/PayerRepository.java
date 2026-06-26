package com.healthcare.payer.repository;

import com.healthcare.payer.entity.PayerRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayerRepository
        extends JpaRepository<PayerRequest, Long> {
}