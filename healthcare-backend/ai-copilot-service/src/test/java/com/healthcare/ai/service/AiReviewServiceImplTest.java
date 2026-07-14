package com.healthcare.ai.service;

import com.healthcare.ai.entity.*;
import com.healthcare.ai.repository.AiReviewRepository;
import com.healthcare.ai.service.impl.AiReviewServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiReviewServiceImplTest {

    @Mock
    private AiReviewRepository repository;

    @InjectMocks
    private AiReviewServiceImpl service;

    @Test
    void shouldCreateSuccessfully() {
        AiReview p = AiReview.builder().id(1L).validRequest(false).recommendations("Patient ID is missing").build();
        when(repository.save(any(AiReview.class))).thenReturn(p);
        AiReview result = service.review(new java.util.HashMap<String,String>());
        assertFalse(result.isValidRequest());
        verify(repository).save(any(AiReview.class));
    }
}
