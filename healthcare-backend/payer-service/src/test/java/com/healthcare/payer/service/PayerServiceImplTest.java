package com.healthcare.payer.service;

import com.healthcare.payer.entity.*;
import com.healthcare.payer.repository.PayerRepository;
import com.healthcare.payer.service.impl.PayerServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayerServiceImplTest {

    @Mock
    private PayerRepository repository;

    @InjectMocks
    private PayerServiceImpl service;

    @Test
    void shouldCreateSuccessfully() {
        Payer p = Payer.builder().id(1L).payerName("Blue").payerCode("B1").build();
        when(repository.save(any(Payer.class))).thenReturn(p);
        Payer result = service.create(p);
        assertEquals("Blue", result.getPayerName());
        verify(repository).save(any(Payer.class));
    }
}
