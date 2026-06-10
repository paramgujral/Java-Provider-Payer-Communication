package com.example.demo.services;

import com.example.demo.model.Payer;
import com.example.demo.repository.PayerRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PayserService {

    private final PayerRepository payerRepository;


    public List<Payer> getAllPayers() {

        return payerRepository.findAll();
    }



}
