package com.healthcare.repository;

import com.healthcare.entity.NetworkAffiliation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NetworkAffiliationRepository extends MongoRepository<NetworkAffiliation, String> {
    List<NetworkAffiliation> findByProviderId(String providerId);
    List<NetworkAffiliation> findByPayerId(String payerId);
    Optional<NetworkAffiliation> findByProviderIdAndPayerId(String providerId, String payerId);
}
