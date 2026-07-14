package com.healthcare.provider.service;

import com.healthcare.provider.entity.*;
import com.healthcare.provider.repository.ProviderRepository;
import com.healthcare.provider.service.impl.ProviderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProviderServiceImplTest {

    @Mock
    private ProviderRepository repository;

    @InjectMocks
    private ProviderServiceImpl service;

    @Test
    void shouldCreateSuccessfully() {
        Provider p = Provider.builder().id(1L).providerName("Apollo").npiNumber("NPI1").build();
        when(repository.save(any(Provider.class))).thenReturn(p);
        Provider result = service.create(p);
        assertEquals("Apollo", result.getProviderName());
        verify(repository).save(any(Provider.class));
    }
}
