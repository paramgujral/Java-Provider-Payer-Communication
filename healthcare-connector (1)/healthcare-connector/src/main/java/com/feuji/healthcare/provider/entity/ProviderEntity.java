package com.feuji.healthcare.provider.entity;

import com.feuji.healthcare.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "providers")
public class ProviderEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String providerCode;

    private String providerName;

    private String email;

    private String phoneNumber;

    private String address;

    private Boolean active;
}
