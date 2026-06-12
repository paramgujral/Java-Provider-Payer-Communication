package com.healthcare.connector.service;

import com.healthcare.connector.model.AuthorizationCase;
import com.healthcare.connector.model.Communication;
import com.healthcare.connector.model.User;
import com.healthcare.connector.repository.AuthorizationCaseRepository;
import com.healthcare.connector.repository.CommunicationRepository;
import com.healthcare.connector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CommunicationService {

    @Autowired
    private CommunicationRepository communicationRepository;

    @Autowired
    private AuthorizationCaseRepository caseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Map<String, Object>> getMessages(String caseId) {
        AuthorizationCase aCase = caseRepository.findByCaseId(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));
        return communicationRepository.findByAuthorizationCaseOrderBySentAtAsc(aCase)
                .stream().map(this::mapMessage).toList();
    }

    @Transactional
    public Map<String, Object> sendMessage(String caseId, String content,
                                           String messageType, String senderUsername) {
        AuthorizationCase aCase = caseRepository.findByCaseId(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found: " + caseId));
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + senderUsername));

        Communication msg = new Communication();
        msg.setAuthorizationCase(aCase);
        msg.setSender(sender);
        msg.setMessageContent(content);
        msg.setMessageType(Communication.MessageType.valueOf(
                messageType != null ? messageType.toUpperCase() : "CHAT"));

        Communication saved = communicationRepository.save(msg);
        Map<String, Object> response = mapMessage(saved);

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/case/" + caseId, response);

        return response;
    }

    private Map<String, Object> mapMessage(Communication msg) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", msg.getId());
        map.put("fhirResourceId", msg.getFhirResourceId());
        map.put("caseId", msg.getAuthorizationCase().getCaseId());
        map.put("senderUsername", msg.getSender().getUsername());
        map.put("senderFullName", msg.getSender().getFullName());
        map.put("senderRole", msg.getSender().getRole().name());
        map.put("messageContent", msg.getMessageContent());
        map.put("messageType", msg.getMessageType().name());
        map.put("sentAt", msg.getSentAt() != null ? msg.getSentAt().toString() : null);
        return map;
    }
}
