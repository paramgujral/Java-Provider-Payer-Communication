package com.healthconnector.controller;

import com.healthconnector.dto.LoginDtos.LoginRequest;
import com.healthconnector.dto.LoginDtos.LoginResponse;
import com.healthconnector.model.AppUser;
import com.healthconnector.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        try {
            AppUser user = authService.authenticate(req.getUsername(), req.getPassword());
            String token = authService.issueToken(user);
            return ResponseEntity.ok(new LoginResponse(user.getUsername(), user.getRole(), token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        }
    }
}
