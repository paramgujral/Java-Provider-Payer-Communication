package com.healthconnector.config;

import com.healthconnector.model.AppUser;
import com.healthconnector.model.UserRole;
import com.healthconnector.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;

    public DataSeeder(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(user("provider1", "password", UserRole.PROVIDER));
            userRepository.save(user("payer1", "password", UserRole.PAYER));
        }
    }

    private AppUser user(String username, String password, UserRole role) {
        AppUser u = new AppUser();
        u.setUsername(username);
        u.setPassword(password);
        u.setRole(role);
        return u;
    }
}
