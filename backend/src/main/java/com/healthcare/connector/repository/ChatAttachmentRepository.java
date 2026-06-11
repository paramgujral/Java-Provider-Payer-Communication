package com.healthcare.connector.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.healthcare.connector.entity.ChatAttachment;
@Repository
public interface ChatAttachmentRepository extends JpaRepository<ChatAttachment, Long> {
}
