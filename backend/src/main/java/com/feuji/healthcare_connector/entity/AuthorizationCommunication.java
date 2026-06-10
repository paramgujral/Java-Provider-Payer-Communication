package com.feuji.healthcare_connector.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_communications")
public class AuthorizationCommunication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long authorizationRequestId;

    public String fromRole;

    public String toRole;

    public String eventType;

    @Column(length = 2000)
    public String message;

    public LocalDateTime createdAt;
}