package com.healthcare.connector.authorization.entity;

import com.healthcare.connector.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private AuthorizationRequest authorizationRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    private String authorName;
    private String authorRole;

    @Column(length = 2000)
    private String content;

    private boolean isInternal;       // Internal payer note vs public note
    private boolean isAiGenerated;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}

