package com.sana.healthcareconnector.controller;

import com.sana.healthcareconnector.dto.AuthenticationRequestDTO;
import com.sana.healthcareconnector.dto.AuthenticationResponseDTO;
import com.sana.healthcareconnector.entity.User;
import com.sana.healthcareconnector.security.JwtService;
import com.sana.healthcareconnector.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AuthenticationRequestDTO request) {

        User user = userService.findByUsername(
                request.getUsername());

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getUserRole().name());

        AuthenticationResponseDTO response =
                new AuthenticationResponseDTO(
                        token,
                        user.getUsername(),
                        user.getUserRole().name());

        return ResponseEntity.ok(response);
    }
}