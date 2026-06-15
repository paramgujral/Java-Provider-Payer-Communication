package com.healthcare.repository;

import com.healthcare.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(String role);
    Optional<User> findFirstByOrganizationId(String organizationId);
    List<User> findByOrganizationId(String organizationId);
}
