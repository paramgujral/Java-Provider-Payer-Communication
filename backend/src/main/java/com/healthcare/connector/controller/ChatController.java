package com.healthcare.connector.controller;

import com.healthcare.connector.dto.MessageDto;
import com.healthcare.connector.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasAnyRole(\'Provider\', \'Payer\')")
    public ResponseEntity<List<MessageDto>> getMessagesByRequestId(@PathVariable Long requestId) {
        return ResponseEntity.ok(chatService.getMessagesByRequestId(requestId));
    }

    @PostMapping("/{requestId}")
    @PreAuthorize("hasAnyRole(\'Provider\', \'Payer\')")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable Long requestId, @RequestBody MessageDto messageDto) {
        return ResponseEntity.ok(chatService.sendMessage(requestId, messageDto));
    }
}
