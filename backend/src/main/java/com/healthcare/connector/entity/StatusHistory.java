package com.healthcare.connector.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class StatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long requestId;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus oldStatus;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus newStatus;
    
    private Long changedBy;

    @CreatedDate
    private LocalDateTime changedDate;
}
