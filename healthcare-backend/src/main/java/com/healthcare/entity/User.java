package com.healthcare.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String role; // PROVIDER or PAYER
    
    // Maps to providerId or payerId in the system
    private String organizationId; 
    
    private String firstName;
    private String lastName;
    
    @Builder.Default
    private boolean active = false;
    
    @Builder.Default
    private boolean orgAdmin = false;
    
    // Address fields
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    
    // Password reset fields
    private String passwordResetToken;
    private Date passwordResetTokenExpiry;
}
