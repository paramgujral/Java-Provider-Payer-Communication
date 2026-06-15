package com.example.demo.ai_validation.model;

import java.time.LocalDateTime;

import com.example.demo.ai_validation.utils.ReviewDecision;
import com.example.demo.health_care.model.BaseEntity;
import com.example.demo.health_care.model.User;
import com.example.demo.insurance.model.Claim;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "claim_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimReview extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private ReviewDecision decision;

    @Column(length = 2000)
    private String comments;

    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id")
    private Claim claim;
}