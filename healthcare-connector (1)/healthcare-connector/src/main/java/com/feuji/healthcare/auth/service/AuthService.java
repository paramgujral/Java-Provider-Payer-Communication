package com.feuji.healthcare.auth.service;

import com.feuji.healthcare.auth.dto.LoginRequestDto;
import com.feuji.healthcare.auth.dto.LoginResponseDto;
import com.feuji.healthcare.auth.dto.RegisterRequestDto;

public interface AuthService {

    void register(RegisterRequestDto request);

    LoginResponseDto login(LoginRequestDto request);
}
