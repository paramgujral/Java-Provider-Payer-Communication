package com.healthindustry.healthindustry.controller;


import com.healthindustry.healthindustry.dto.LoginRequestDTO;
import com.healthindustry.healthindustry.dto.LoginResponseDTO;
import com.healthindustry.healthindustry.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final AuthorizationService service;

    @PostMapping("/login")
    public LoginResponseDTO login(
            @RequestBody LoginRequestDTO request) {

        return service.login(request);
    }
    }