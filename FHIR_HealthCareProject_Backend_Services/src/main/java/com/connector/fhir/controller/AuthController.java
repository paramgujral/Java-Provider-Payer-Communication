package com.connector.fhir.controller;

import com.connector.fhir.dto.AuthRequestDto;
import com.connector.fhir.dto.AuthResponseDto;
import com.connector.fhir.model.User;
import com.connector.fhir.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDto request) {
        java.util.Optional<User> optUser = userService.authenticate(request.getEmail(), request.getPassword());
        if (optUser.isPresent()) {
            User user = optUser.get();
            AuthResponseDto response = new AuthResponseDto(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }
}
