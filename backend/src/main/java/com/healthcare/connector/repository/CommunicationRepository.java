package com.healthcare.connector.repository;

import com.healthcare.connector.model.Communication;
import com.healthcare.connector.model.AuthorizationCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunicationRepository extends JpaRepository<Communication, Long> {
    List<Communication> findByAuthorizationCaseOrderBySentAtAsc(AuthorizationCase authorizationCase);
}
