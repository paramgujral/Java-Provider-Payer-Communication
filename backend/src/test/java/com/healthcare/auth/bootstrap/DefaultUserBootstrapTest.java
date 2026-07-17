package com.healthcare.auth.bootstrap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DefaultUserBootstrapTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DefaultUserBootstrap defaultUserBootstrap;

    @Test
    void shouldCreateDefaultUsersWhenMissing() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(User.builder().email("provider.submit.9e7a15dd@example.com").build()));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        defaultUserBootstrap.run(null);

        verify(userRepository, times(3)).save(any(User.class));
        verify(userRepository, times(3)).findByEmail(anyString());
    }
}
