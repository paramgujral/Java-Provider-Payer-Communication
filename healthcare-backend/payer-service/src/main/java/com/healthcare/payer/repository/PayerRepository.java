package com.healthcare.payer.repository;

import com.healthcare.payer.entity.Payer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayerRepository extends JpaRepository<Payer, Long> {

}
