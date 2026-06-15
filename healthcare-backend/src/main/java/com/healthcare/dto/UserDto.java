package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String email;
    private String role;
    private String organizationId; 
    private String firstName;
    private String lastName;
    private boolean active;
    
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
}
