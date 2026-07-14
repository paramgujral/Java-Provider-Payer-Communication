package com.feuji.healthcare_connector.repository;

import com.feuji.healthcare_connector.entity.Document;
import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByRequest(AuthorizationRequest request);
    List<Document> findAllByRequestId(Long requestId);
}
