package com.healthindustry.healthindustry.dto;

import com.healthindustry.healthindustry.entity.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {

    private Long id;
    private String username;
    private Role role;
}