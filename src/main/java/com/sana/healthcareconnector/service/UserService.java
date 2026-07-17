package com.sana.healthcareconnector.service;

import com.sana.healthcareconnector.entity.User;
import com.sana.healthcareconnector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }
}