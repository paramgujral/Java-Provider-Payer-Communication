package com.healthcare.repository;

import com.healthcare.entity.NetworkMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NetworkMessageRepository extends MongoRepository<NetworkMessage, String> {
    List<NetworkMessage> findByAffiliationIdOrderByCreatedAtAsc(String affiliationId);
}
