package com.example.demo.ai_validation.model;

import java.time.LocalDateTime;

import com.example.demo.health_care.model.BaseEntity;
import com.example.demo.insurance.model.Claim;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ai_validations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIValidation extends BaseEntity {

    private Integer score;

    private String result;

    @Column(length = 3000)
    private String remarks;

    private LocalDateTime validatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id")
    private Claim claim;
}