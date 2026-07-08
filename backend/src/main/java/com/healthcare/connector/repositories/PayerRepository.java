package com.healthcare.connector.repositories;

import com.healthcare.connector.models.Payer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayerRepository extends JpaRepository<Payer, Long> {
}
