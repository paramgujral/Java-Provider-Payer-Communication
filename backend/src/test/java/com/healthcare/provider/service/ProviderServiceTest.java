package com.healthcare.provider.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.healthcare.common.enums.Role;
import com.healthcare.provider.dto.CreateProviderRequest;
import com.healthcare.provider.dto.ProviderResponse;
import com.healthcare.provider.entity.Provider;
import com.healthcare.provider.enums.ProviderStatus;
import com.healthcare.provider.repository.ProviderRepository;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProviderServiceTest {

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProviderService providerService;

    @Test
    void createProviderShouldPersistAndReturnResponse() {
        CreateProviderRequest request = CreateProviderRequest.builder()
                .providerCode("PRV-100")
                .hospitalName("City Hospital")
                .specialization("Cardiology")
                .licenseNumber("LIC-123")
                .phone("555-0100")
                .email("provider@example.com")
                .address("123 Main St")
                .city("Seattle")
                .state("WA")
                .country("USA")
                .status(ProviderStatus.ACTIVE)
                .build();

        User user = User.builder()
                .id(7L)
                .email("provider@example.com")
                .role(Role.PROVIDER)
                .build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(providerRepository.existsByProviderCode("PRV-100")).thenReturn(false);
        when(providerRepository.save(any(Provider.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProviderResponse response = providerService.createProvider(request, 7L);

        assertEquals("PRV-100", response.getProviderCode());
        assertEquals("City Hospital", response.getHospitalName());
        assertEquals(7L, response.getUserId());
        verify(providerRepository).save(any(Provider.class));
    }
}
