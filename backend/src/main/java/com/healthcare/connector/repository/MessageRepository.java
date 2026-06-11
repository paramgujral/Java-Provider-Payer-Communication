package com.healthcare.connector.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.healthcare.connector.entity.Message;
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRequestIdOrderByCreatedDateAsc(Long requestId);
}
