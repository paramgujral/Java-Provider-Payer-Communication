package com.feuji.healthcare.payer.entity;

import com.feuji.healthcare.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayerEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String payerCode;

    private String payerName;

    private String email;

    private String phoneNumber;

    private String address;

    private Boolean active;
}
