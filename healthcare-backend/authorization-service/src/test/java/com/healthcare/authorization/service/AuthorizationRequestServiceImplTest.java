package com.healthcare.authorization.service;

import com.healthcare.authorization.entity.*;
import com.healthcare.authorization.repository.AuthorizationRequestRepository;
import com.healthcare.authorization.service.impl.AuthorizationRequestServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthorizationRequestServiceImplTest {

    @Mock
    private AuthorizationRequestRepository repository;

    @InjectMocks
    private AuthorizationRequestServiceImpl service;

    @Test
    void shouldCreateSuccessfully() {
        AuthorizationRequest p = AuthorizationRequest.builder().id(1L).patientId("PAT1").procedureCode("P1").diagnosisCode("D1").build();
        when(repository.save(any(AuthorizationRequest.class))).thenReturn(p);
        AuthorizationRequest result = service.create(p);
        assertEquals("PAT1", result.getPatientId());
        verify(repository).save(any(AuthorizationRequest.class));
    }
}
