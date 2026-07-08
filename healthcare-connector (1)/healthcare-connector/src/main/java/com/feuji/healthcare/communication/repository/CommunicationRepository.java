package com.feuji.healthcare.communication.repository;

import com.feuji.healthcare.communication.entity.CommunicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunicationRepository
        extends JpaRepository<CommunicationEntity, Long> {

    List<CommunicationEntity>
    findByAuthorizationRequestId(Long authorizationId);
}