package com.healthcare.notification.service;

import com.healthcare.notification.entity.*;
import com.healthcare.notification.repository.NotificationRepository;
import com.healthcare.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository repository;

    @InjectMocks
    private NotificationServiceImpl service;

    @Test
    void shouldCreateSuccessfully() {
        Notification p = Notification.builder().id(1L).receiverEmail("test@test.com").build();
        when(repository.save(any(Notification.class))).thenReturn(p);
        Notification result = service.send(p);
        assertEquals("test@test.com", result.getReceiverEmail());
        verify(repository).save(any(Notification.class));
    }
}
