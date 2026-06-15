package com.healthcare.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "network_messages")
@CompoundIndex(name = "affiliation_time_idx", def = "{'affiliationId': 1, 'createdAt': 1}")
public class NetworkMessage {
    @Id
    private String id;

    private String affiliationId;
    private String senderId;
    private String senderRole; // PROVIDER or PAYER
    private String content;

    @CreatedDate
    private Instant createdAt;
}
