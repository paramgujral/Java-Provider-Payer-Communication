package com.healthcare.connector.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "authorization_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AuthorizationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private String patientId;
    private String patientName;
    private String insuranceId;
    private String insuranceProvider;
    private String diagnosis;
    private String procedureName;
    
    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;
    
    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private Long providerId;
    private Long payerId;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "authorizationRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

}
