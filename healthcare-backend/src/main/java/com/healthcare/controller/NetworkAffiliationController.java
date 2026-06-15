package com.healthcare.controller;

import com.healthcare.dto.NetworkAffiliationDto;
import com.healthcare.entity.NetworkAffiliation;
import com.healthcare.entity.User;
import com.healthcare.entity.NetworkMessage;
import com.healthcare.repository.NetworkAffiliationRepository;
import com.healthcare.repository.NetworkMessageRepository;
import com.healthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/network")
@RequiredArgsConstructor
public class NetworkAffiliationController {

    private final NetworkAffiliationRepository networkAffiliationRepository;
    private final NetworkMessageRepository networkMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @PostMapping("/request")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> requestAffiliation(@RequestBody NetworkAffiliationDto request) {
        // Check if already exists
        Optional<NetworkAffiliation> existing = networkAffiliationRepository
                .findByProviderIdAndPayerId(request.getProviderId(), request.getPayerId());
        
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Affiliation request already exists.");
        }

        NetworkAffiliation affiliation = NetworkAffiliation.builder()
                .providerId(request.getProviderId())
                .payerId(request.getPayerId())
                .status(NetworkAffiliation.AffiliationStatus.PENDING)
                .notes(request.getNotes())
                .build();

        NetworkAffiliation saved = networkAffiliationRepository.save(affiliation);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDto(saved));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<?> updateAffiliationStatus(@PathVariable String id, @RequestParam NetworkAffiliation.AffiliationStatus status) {
        NetworkAffiliation affiliation = networkAffiliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affiliation not found"));

        affiliation.setStatus(status);
        NetworkAffiliation saved = networkAffiliationRepository.save(affiliation);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<NetworkAffiliationDto>> getProviderAffiliations(@PathVariable String providerId) {
        List<NetworkAffiliationDto> dtos = networkAffiliationRepository.findByProviderId(providerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/payer/{payerId}")
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<List<NetworkAffiliationDto>> getPayerAffiliations(@PathVariable String payerId) {
        List<NetworkAffiliationDto> dtos = networkAffiliationRepository.findByPayerId(payerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{affiliationId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String affiliationId, @RequestBody com.healthcare.dto.NetworkMessageDto request) {
        NetworkAffiliation affiliation = networkAffiliationRepository.findById(affiliationId)
                .orElseThrow(() -> new RuntimeException("Affiliation not found"));

        if (affiliation.getStatus() != NetworkAffiliation.AffiliationStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Affiliation is not approved.");
        }

        NetworkMessage message = NetworkMessage.builder()
                .affiliationId(affiliationId)
                .senderId(request.getSenderId())
                .senderRole(request.getSenderRole())
                .content(request.getContent())
                .build();

        NetworkMessage saved = networkMessageRepository.save(message);
        
        com.healthcare.dto.NetworkMessageDto responseDto = mapToMessageDto(saved);
        messagingTemplate.convertAndSend("/topic/chat/" + affiliationId, responseDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @GetMapping("/{affiliationId}/messages")
    public ResponseEntity<List<com.healthcare.dto.NetworkMessageDto>> getMessages(@PathVariable String affiliationId) {
        // Optional: verify user has access to this affiliation (skipping for simplicity based on existing patterns)
        List<com.healthcare.dto.NetworkMessageDto> dtos = networkMessageRepository.findByAffiliationIdOrderByCreatedAtAsc(affiliationId)
                .stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private com.healthcare.dto.NetworkMessageDto mapToMessageDto(NetworkMessage message) {
        return com.healthcare.dto.NetworkMessageDto.builder()
                .id(message.getId())
                .affiliationId(message.getAffiliationId())
                .senderId(message.getSenderId())
                .senderRole(message.getSenderRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private NetworkAffiliationDto mapToDto(NetworkAffiliation affiliation) {
        String providerName = userRepository.findFirstByOrganizationId(affiliation.getProviderId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown Provider");

        String payerName = userRepository.findFirstByOrganizationId(affiliation.getPayerId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown Payer");

        return NetworkAffiliationDto.builder()
                .id(affiliation.getId())
                .providerId(affiliation.getProviderId())
                .payerId(affiliation.getPayerId())
                .providerName(providerName)
                .payerName(payerName)
                .status(affiliation.getStatus())
                .notes(affiliation.getNotes())
                .requestedAt(affiliation.getRequestedAt())
                .updatedAt(affiliation.getUpdatedAt())
                .build();
    }
}
