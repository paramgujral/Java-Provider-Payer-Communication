package com.feuji.healthcare.communication.entity;

import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.common.entity.AuditEntity;
import com.feuji.healthcare.communication.enums.CommunicationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "communications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunicationEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "authorization_id")
    private AuthorizationRequestEntity authorizationRequest;

    @Enumerated(EnumType.STRING)
    private CommunicationType senderType;

    @Column(length = 2000)
    private String message;
}