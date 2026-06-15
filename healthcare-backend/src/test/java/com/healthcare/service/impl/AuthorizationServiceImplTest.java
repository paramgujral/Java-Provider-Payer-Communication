//package com.healthcare.service.impl;
//
//import com.healthcare.entity.AuthorizationRequest;
//import com.healthcare.exception.ResourceNotFoundException;
//import com.healthcare.repository.AuthorizationRequestRepository;
//import com.healthcare.service.NotificationService;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class AuthorizationServiceImplTest {
//
//    @Mock
//    private AuthorizationRequestRepository repository;
//
//    @Mock
//    private NotificationService notificationService;
//
//    @InjectMocks
//    private AuthorizationServiceImpl service;
//
//    @Test
//    void createRequest_ShouldSaveAndNotifyPayer() {
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setProviderId("PROV-1");
//        request.setPayerId("PAY-1");
//
//        when(repository.save(any(AuthorizationRequest.class))).thenReturn(request);
//
//        AuthorizationRequest result = service.createRequest(request);
//
//        assertNotNull(result);
//        assertEquals(AuthorizationRequest.RequestStatus.PENDING, request.getStatus());
//        assertNotNull(request.getCreatedAt());
//        verify(repository, times(1)).save(request);
//        // Verify notification was triggered
//        verify(notificationService, times(1))
//                .notifyStatusChange(any(), eq(AuthorizationRequest.RequestStatus.PENDING));
//    }
//
//    @Test
//    void getRequestById_WhenExists_ShouldReturnRequest() {
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setId("REQ-1");
//
//        when(repository.findById("REQ-1")).thenReturn(Optional.of(request));
//
//        AuthorizationRequest result = service.getRequestById("REQ-1");
//
//        assertNotNull(result);
//        assertEquals("REQ-1", result.getId());
//    }
//
//    @Test
//    void getRequestById_WhenNotExists_ShouldThrowException() {
//        when(repository.findById("REQ-2")).thenReturn(Optional.empty());
//
//        assertThrows(ResourceNotFoundException.class, () -> service.getRequestById("REQ-2"));
//    }
//
//    @Test
//    void updateStatus_ShouldUpdateSaveAndNotify() {
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setId("REQ-1");
//        request.setProviderId("PROV-1");
//        request.setStatus(AuthorizationRequest.RequestStatus.PENDING);
//
//        when(repository.findById("REQ-1")).thenReturn(Optional.of(request));
//        when(repository.save(any(AuthorizationRequest.class))).thenReturn(request);
//
//        AuthorizationRequest result = service.updateStatus("REQ-1", AuthorizationRequest.RequestStatus.APPROVED);
//
//        assertNotNull(result);
//        assertEquals(AuthorizationRequest.RequestStatus.APPROVED, result.getStatus());
//        verify(repository).save(request);
//        // Verify notification was triggered for the status change
//        verify(notificationService, times(1))
//                .notifyStatusChange(any(), eq(AuthorizationRequest.RequestStatus.APPROVED));
//    }
//
//    @Test
//    void getRequestsByProvider_ShouldReturnPage() {
//        AuthorizationRequest request = new AuthorizationRequest();
//        Page<AuthorizationRequest> page = new PageImpl<>(List.of(request));
//
//        when(repository.findByProviderId(eq("PROV-1"), any(PageRequest.class))).thenReturn(page);
//
//        Page<AuthorizationRequest> result = service.getRequestsByProvider("PROV-1", PageRequest.of(0, 10));
//
//        assertNotNull(result);
//        assertEquals(1, result.getTotalElements());
//    }
//}
