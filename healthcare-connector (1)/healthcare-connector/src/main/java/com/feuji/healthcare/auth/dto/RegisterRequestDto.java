package com.feuji.healthcare.auth.dto;

import lombok.Getter;
import lombok.Setter;
import com.feuji.healthcare.common.enums.RoleType;

@Getter
@Setter
public class RegisterRequestDto {

    private String username;
    private String email;
    private String password;
    private RoleType role;
}