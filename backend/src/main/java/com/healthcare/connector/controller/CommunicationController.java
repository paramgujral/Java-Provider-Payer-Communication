package com.healthcare.connector.controller;

import com.healthcare.connector.service.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/communication")
@Tag(name = "Communication", description = "FHIR Communication (In-case chat) endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CommunicationController {

    @Autowired
    private CommunicationService communicationService;

    @GetMapping("/{caseId}/messages")
    @Operation(summary = "Get all messages for a case")
    public ResponseEntity<?> getMessages(@PathVariable String caseId) {
        return ResponseEntity.ok(communicationService.getMessages(caseId));
    }

    @PostMapping("/send")
    @Operation(summary = "Send a message in a case chat")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> body,
                                          Authentication authentication) {
        try {
            return ResponseEntity.ok(communicationService.sendMessage(
                    body.get("caseId"),
                    body.get("messageContent"),
                    body.get("messageType"),
                    authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
