package com.feuji.healthcare.security.service;

import com.feuji.healthcare.auth.entity.UserEntity;
import com.feuji.healthcare.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        UserEntity user =
                userRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "User not found"));

        return new User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles()
                        .stream()
                        .map(role ->
                                new SimpleGrantedAuthority(
                                        role.getRoleName().name()))
                        .collect(Collectors.toList())
        );
    }
}
