package com.healthindustry.healthindustry.repository;

import com.healthindustry.healthindustry.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User>
    findByUsernameAndPassword(
            String username,
            String password
    );
}