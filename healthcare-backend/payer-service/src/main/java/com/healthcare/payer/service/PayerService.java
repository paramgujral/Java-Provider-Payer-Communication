package com.healthcare.payer.service;

import com.healthcare.payer.entity.Payer;
import java.util.List;

public interface PayerService {
    Payer create(Payer payer);
    Payer getById(Long id);
    List<Payer> getAll();
    Payer update(Long id, Payer payer);
    void delete(Long id);
}
