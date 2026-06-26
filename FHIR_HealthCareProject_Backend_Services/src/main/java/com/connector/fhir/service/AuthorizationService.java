package com.connector.fhir.service;

import com.connector.fhir.dto.AIReviewResultDto;
import com.connector.fhir.dto.AuthorizationRequestDto;
import com.connector.fhir.dto.MessageDto;
import com.connector.fhir.model.*;
import com.connector.fhir.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthorizationService {

    private final AuthorizationRequestRepository requestRepository;
    private final PatientRepository patientRepository;
    private final CoverageRepository coverageRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository historyRepository;
    private final MessageRepository messageRepository;
    private final AIReviewRepository aiReviewRepository;
    private final NotificationService notificationService;
    private final AIService aiService;

    public AuthorizationService(
            AuthorizationRequestRepository requestRepository,
            PatientRepository patientRepository,
            CoverageRepository coverageRepository,
            UserRepository userRepository,
            StatusHistoryRepository historyRepository,
            MessageRepository messageRepository,
            AIReviewRepository aiReviewRepository,
            NotificationService notificationService,
            AIService aiService) {
        this.requestRepository = requestRepository;
        this.patientRepository = patientRepository;
        this.coverageRepository = coverageRepository;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.messageRepository = messageRepository;
        this.aiReviewRepository = aiReviewRepository;
        this.notificationService = notificationService;
        this.aiService = aiService;
    }

    @Transactional
    public AuthorizationRequest createRequest(AuthorizationRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + dto.getPatientId()));
        Coverage coverage = coverageRepository.findById(dto.getCoverageId())
                .orElseThrow(() -> new IllegalArgumentException("Coverage not found with ID: " + dto.getCoverageId()));
        
        Long providerId = dto.getProviderId() != null ? dto.getProviderId() : 1L;
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));

        AuthorizationRequest request = new AuthorizationRequest();
        request.setPatient(patient);
        request.setCoverage(coverage);
        request.setProvider(provider);
        request.setDiagnosisCode(dto.getDiagnosisCode());
        request.setDiagnosisDescription(dto.getDiagnosisDescription());
        request.setTreatmentCode(dto.getTreatmentCode());
        request.setTreatmentDescription(dto.getTreatmentDescription());
        request.setNotes(dto.getNotes());
        
        String initialStatus = dto.getStatus() != null ? dto.getStatus() : "SUBMITTED";
        request.setStatus(initialStatus);

        // Run AI Copilot Analysis
        AIReviewResultDto aiReview = aiService.analyzeRequest(dto);
        request.setConfidenceScore(aiReview.getConfidenceScore());

        // Build FHIR Claim Resource representation
        String fhirResource = generateFhirClaimJson(patient, coverage, dto);
        request.setFhirResource(fhirResource);

        AuthorizationRequest savedRequest = requestRepository.save(request);

        // Save AI review result
        AIReview persistedReview = new AIReview(
                savedRequest,
                aiReview.getConfidenceScore(),
                aiReview.getStatusValidation(),
                String.join(";", aiReview.getIssues()),
                String.join(";", aiReview.getRecommendations())
        );
        aiReviewRepository.save(persistedReview);

        // Audit Trail
        saveHistory(savedRequest, initialStatus, "Prior authorization request initialized", provider);

        // Notifications
        if ("SUBMITTED".equalsIgnoreCase(initialStatus)) {
            notifyPayers("New prior authorization request submitted (ID: " + savedRequest.getId() + ") for Patient: " + patient.getFirstName() + " " + patient.getLastName());
        }

        return savedRequest;
    }

    @Transactional
    public AuthorizationRequest updateRequest(Long id, AuthorizationRequestDto dto) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + dto.getPatientId()));
        Coverage coverage = coverageRepository.findById(dto.getCoverageId())
                .orElseThrow(() -> new IllegalArgumentException("Coverage not found with ID: " + dto.getCoverageId()));

        request.setPatient(patient);
        request.setCoverage(coverage);
        request.setDiagnosisCode(dto.getDiagnosisCode());
        request.setDiagnosisDescription(dto.getDiagnosisDescription());
        request.setTreatmentCode(dto.getTreatmentCode());
        request.setTreatmentDescription(dto.getTreatmentDescription());
        request.setNotes(dto.getNotes());

        // If updated, set status back to SUBMITTED if it was in INFO_REQUIRED
        String prevStatus = request.getStatus();
        String nextStatus = "SUBMITTED";
        request.setStatus(nextStatus);

        // Re-analyze
        AIReviewResultDto aiReview = aiService.analyzeRequest(dto);
        request.setConfidenceScore(aiReview.getConfidenceScore());

        String fhirResource = generateFhirClaimJson(patient, coverage, dto);
        request.setFhirResource(fhirResource);

        AuthorizationRequest savedRequest = requestRepository.save(request);

        // Update AI Review
        aiReviewRepository.findByRequestId(id).ifPresentOrElse(review -> {
            review.setConfidenceScore(aiReview.getConfidenceScore());
            review.setStatusValidation(aiReview.getStatusValidation());
            review.setIssues(String.join(";", aiReview.getIssues()));
            review.setRecommendations(String.join(";", aiReview.getRecommendations()));
            aiReviewRepository.save(review);
        }, () -> {
            AIReview persistedReview = new AIReview(
                    savedRequest,
                    aiReview.getConfidenceScore(),
                    aiReview.getStatusValidation(),
                    String.join(";", aiReview.getIssues()),
                    String.join(";", aiReview.getRecommendations())
            );
            aiReviewRepository.save(persistedReview);
        });

        // Audit Trail
        saveHistory(savedRequest, nextStatus, "Request updated and resubmitted by provider", request.getProvider());

        // Notify Payer
        notifyPayers("Prior authorization request (ID: " + id + ") has been updated and resubmitted.");

        return savedRequest;
    }

    public List<AuthorizationRequest> getRequestsForProvider(Long providerId) {
        return requestRepository.findByProviderId(providerId);
    }

    public List<AuthorizationRequest> getRequestsForPayer() {
        return requestRepository.findAllNonDraftRequests();
    }

    public Optional<AuthorizationRequest> getRequestById(Long id) {
        return requestRepository.findById(id);
    }

    @Transactional
    public AuthorizationRequest updateStatus(Long id, String status, String note, Long userId) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        request.setStatus(status);
        if ("APPROVED".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status)) {
            request.setPayer(user);
        }
        
        AuthorizationRequest saved = requestRepository.save(request);
        saveHistory(saved, status, note, user);

        // Notify Provider
        notificationService.createNotification(request.getProvider(), 
                "Prior Authorization Request (ID: " + id + ") status updated to: " + status + ". Note: " + note);

        return saved;
    }

    @Transactional
    public Message addMessage(Long requestId, Long senderId, String messageContent) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Message message = new Message(request, sender, messageContent);
        Message savedMessage = messageRepository.save(message);

        // Notification
        if ("ROLE_PAYER".equals(sender.getRole())) {
            notificationService.createNotification(request.getProvider(),
                    "New comment from Payer on Request (ID: " + requestId + "): " + messageContent);
        } else {
            notifyPayers("New comment from Provider on Request (ID: " + requestId + "): " + messageContent);
        }

        return savedMessage;
    }

    public List<MessageDto> getMessages(Long requestId) {
        return messageRepository.findByRequestIdOrderByCreatedAtAsc(requestId).stream()
                .map(m -> new MessageDto(
                        m.getId(),
                        m.getRequest().getId(),
                        m.getSender().getId(),
                        m.getSender().getName(),
                        m.getSender().getRole(),
                        m.getMessage(),
                        m.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public List<StatusHistory> getStatusHistory(Long requestId) {
        return historyRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
    }

    private void saveHistory(AuthorizationRequest request, String status, String notes, User updatedBy) {
        StatusHistory history = new StatusHistory(request, status, notes, updatedBy);
        historyRepository.save(history);
    }

    private void notifyPayers(String message) {
        List<User> payers = userRepository.findAll().stream()
                .filter(u -> "ROLE_PAYER".equals(u.getRole()))
                .collect(Collectors.toList());
        for (User payer : payers) {
            notificationService.createNotification(payer, message);
        }
    }

    private String generateFhirClaimJson(Patient p, Coverage c, AuthorizationRequestDto dto) {
        // Quick builder for compliance standard FHIR Claims resource
        return "{\n" +
                "  \"resourceType\": \"Claim\",\n" +
                "  \"id\": \"claim-" + System.currentTimeMillis() + "\",\n" +
                "  \"status\": \"active\",\n" +
                "  \"use\": \"preauthorization\",\n" +
                "  \"patient\": {\n" +
                "    \"reference\": \"Patient/" + p.getFhirId() + "\",\n" +
                "    \"display\": \"" + p.getFirstName() + " " + p.getLastName() + "\"\n" +
                "  },\n" +
                "  \"created\": \"" + Instant.now().toString() + "\",\n" +
                "  \"provider\": {\n" +
                "    \"reference\": \"Organization/prov-org-1\",\n" +
                "    \"display\": \"Central Specialty Medical Group\"\n" +
                "  },\n" +
                "  \"insurer\": {\n" +
                "    \"display\": \"" + c.getPayerName() + "\"\n" +
                "  },\n" +
                "  \"insurance\": [\n" +
                "    {\n" +
                "      \"sequence\": 1,\n" +
                "      \"focal\": true,\n" +
                "      \"coverage\": {\n" +
                "        \"reference\": \"Coverage/" + c.getFhirId() + "\",\n" +
                "        \"display\": \"" + c.getPayerName() + " (" + c.getSubscriberId() + ")\"\n" +
                "      }\n" +
                "    }\n" +
                "  ],\n" +
                "  \"diagnosis\": [\n" +
                "    {\n" +
                "      \"sequence\": 1,\n" +
                "      \"diagnosisCodeableConcept\": {\n" +
                "        \"coding\": [\n" +
                "          {\n" +
                "            \"system\": \"http://hl7.org/fhir/sid/icd-10\",\n" +
                "            \"code\": \"" + dto.getDiagnosisCode() + "\",\n" +
                "            \"display\": \"" + (dto.getDiagnosisDescription() != null ? dto.getDiagnosisDescription() : "") + "\"\n" +
                "          }\n" +
                "        ],\n" +
                "        \"text\": \"" + (dto.getDiagnosisDescription() != null ? dto.getDiagnosisDescription() : "") + "\"\n" +
                "      }\n" +
                "    }\n" +
                "  ],\n" +
                "  \"item\": [\n" +
                "    {\n" +
                "      \"sequence\": 1,\n" +
                "      \"productOrService\": {\n" +
                "        \"coding\": [\n" +
                "          {\n" +
                "            \"system\": \"http://www.ama-assn.org/go/cpt\",\n" +
                "            \"code\": \"" + dto.getTreatmentCode() + "\",\n" +
                "            \"display\": \"" + (dto.getTreatmentDescription() != null ? dto.getTreatmentDescription() : "") + "\"\n" +
                "          }\n" +
                "        ],\n" +
                "        \"text\": \"" + (dto.getTreatmentDescription() != null ? dto.getTreatmentDescription() : "") + "\"\n" +
                "      }\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public List<Coverage> getCoveragesForPatient(Long patientId) {
        return coverageRepository.findByPatientId(patientId);
    }
}
