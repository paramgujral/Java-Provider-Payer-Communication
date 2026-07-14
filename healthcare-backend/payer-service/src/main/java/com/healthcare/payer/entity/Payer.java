package com.healthcare.payer.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "payers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String payerName;

    @NotBlank
    private String payerCode;

    private String email;
    private String phone;
}
