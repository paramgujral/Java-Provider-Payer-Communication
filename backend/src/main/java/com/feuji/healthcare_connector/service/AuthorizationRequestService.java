package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.dto.request.CreateRequestDto;
import com.feuji.healthcare_connector.dto.response.*;
import com.feuji.healthcare_connector.entity.*;
import com.feuji.healthcare_connector.enums.*;
import com.feuji.healthcare_connector.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthorizationRequestService {

    @Autowired
    private AuthorizationRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisService redisService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FhirService fhirService;

    @Transactional
    public AuthorizationRequest createRequest(CreateRequestDto dto, User provider) {
        User payer = userRepository.findById(dto.getPayerId())
                .orElseThrow(() -> new IllegalArgumentException("Payer not found with ID: " + dto.getPayerId()));

        if (payer.getRole() != UserRole.PAYER) {
            throw new IllegalArgumentException("The target user is not a payer.");
        }

        AuthorizationRequest request = new AuthorizationRequest();
        request.setProvider(provider);
        request.setPayer(payer);
        request.setStatus(dto.getStatus() != null ? dto.getStatus() : RequestStatus.DRAFT);
        
        mapDtoToEntity(dto, request);

        try {
            String fhirJson = fhirService.generateFhirBundle(request, null);
            request.setFhirBundleJson(fhirJson);
        } catch (Exception e) {
            System.err.println("Failed to generate FHIR Bundle during creation: " + e.getMessage());
        }

        AuthorizationRequest savedRequest = requestRepository.save(request);

        // Record status history
        saveStatusHistory(savedRequest, null, savedRequest.getStatus(), provider, "Request created");

        // Send notifications if submitted
        if (savedRequest.getStatus() == RequestStatus.SUBMITTED) {
            sendSubmissionNotifications(savedRequest);
        }

        return savedRequest;
    }

    @Transactional
    public AuthorizationRequest updateRequest(Long id, CreateRequestDto dto, User provider) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prior Authorization Request not found with ID: " + id));

        if (!request.getProvider().getId().equals(provider.getId())) {
            throw new AccessDeniedException("You do not have permission to update this request.");
        }

        if (request.getStatus() != RequestStatus.DRAFT && 
            request.getStatus() != RequestStatus.REJECTED && 
            request.getStatus() != RequestStatus.INFO_REQUESTED) {
            throw new IllegalStateException("Only drafts, rejected, or info-requested requests can be updated.");
        }

        RequestStatus oldStatus = request.getStatus();
        RequestStatus newStatus = dto.getStatus() != null ? dto.getStatus() : oldStatus;

        // If it was rejected or info_requested, updating it resets it to SUBMITTED
        if (oldStatus == RequestStatus.REJECTED || oldStatus == RequestStatus.INFO_REQUESTED) {
            if (dto.getStatus() == null || dto.getStatus() == RequestStatus.SUBMITTED) {
                newStatus = RequestStatus.SUBMITTED;
            }
        }

        User payer = userRepository.findById(dto.getPayerId())
                .orElseThrow(() -> new IllegalArgumentException("Payer not found with ID: " + dto.getPayerId()));
        
        request.setPayer(payer);
        request.setStatus(newStatus);
        
        mapDtoToEntity(dto, request);

        try {
            List<Document> docs = documentRepository.findByRequest(request);
            String fhirJson = fhirService.generateFhirBundle(request, docs);
            request.setFhirBundleJson(fhirJson);
        } catch (Exception e) {
            System.err.println("Failed to generate FHIR Bundle during update: " + e.getMessage());
        }

        AuthorizationRequest savedRequest = requestRepository.save(request);

        if (oldStatus != newStatus) {
            saveStatusHistory(savedRequest, oldStatus, newStatus, provider, "Request updated and status changed");
            if (newStatus == RequestStatus.SUBMITTED) {
                sendSubmissionNotifications(savedRequest);
            }
        } else {
            saveStatusHistory(savedRequest, oldStatus, newStatus, provider, "Request updated");
        }

        return savedRequest;
    }

    public RequestDetailsResponse getRequestDetails(Long id, User user) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        if (!request.getProvider().getId().equals(user.getId()) && !request.getPayer().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to view this request.");
        }

        List<Document> docs = documentRepository.findByRequest(request);
        return new RequestDetailsResponse(request, docs);
    }

    public List<RequestDetailsResponse> getProviderRequests(User provider) {
        List<AuthorizationRequest> reqs = requestRepository.findAllByProviderOrderByCreatedAtDesc(provider);
        return reqs.stream()
                .map(r -> new RequestDetailsResponse(r, null))
                .collect(Collectors.toList());
    }

    public Page<RequestDetailsResponse> getProviderRequestsPaginated(User provider, Pageable pageable) {
        return requestRepository.findAllByProvider(provider, pageable)
                .map(r -> new RequestDetailsResponse(r, null));
    }

    public List<RequestDetailsResponse> getPayerRequests(User payer) {
        List<AuthorizationRequest> reqs = requestRepository.findAllByPayerOrderByCreatedAtDesc(payer);
        return reqs.stream()
                .map(r -> new RequestDetailsResponse(r, null))
                .collect(Collectors.toList());
    }

    public Page<RequestDetailsResponse> getPayerRequestsPaginated(User payer, Pageable pageable) {
        return requestRepository.findAllByPayer(payer, pageable)
                .map(r -> new RequestDetailsResponse(r, null));
    }

    @Transactional
    public AuthorizationRequest updateStatusByPayer(Long id, RequestStatus newStatus, String remarks, User payer) {
        AuthorizationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        if (!request.getPayer().getId().equals(payer.getId())) {
            throw new AccessDeniedException("You are not the assigned payer for this request.");
        }

        if (newStatus != RequestStatus.APPROVED && 
            newStatus != RequestStatus.REJECTED && 
            newStatus != RequestStatus.INFO_REQUESTED) {
            throw new IllegalArgumentException("Invalid status update for payer review.");
        }

        if ((newStatus == RequestStatus.REJECTED || newStatus == RequestStatus.INFO_REQUESTED) && 
            (remarks == null || remarks.trim().isEmpty())) {
            throw new IllegalArgumentException("Remarks are mandatory for Rejections and Info Requests.");
        }

        RequestStatus oldStatus = request.getStatus();
        request.setStatus(newStatus);
        request.setPayerRemarks(remarks);

        try {
            List<Document> docs = documentRepository.findByRequest(request);
            String fhirJson = fhirService.generateFhirBundle(request, docs);
            request.setFhirBundleJson(fhirJson);
        } catch (Exception e) {
            System.err.println("Failed to generate FHIR Bundle during payer status update: " + e.getMessage());
        }

        AuthorizationRequest savedRequest = requestRepository.save(request);

        // Record status history
        saveStatusHistory(savedRequest, oldStatus, newStatus, payer, remarks);

        // Send notifications
        sendPayerDecisionNotifications(savedRequest, remarks);

        return savedRequest;
    }

    public ProviderDashboardStats getProviderDashboardStats(User provider) {
        long total = requestRepository.countByProvider(provider);
        long approved = requestRepository.countByProviderAndStatus(provider, RequestStatus.APPROVED);
        long rejected = requestRepository.countByProviderAndStatus(provider, RequestStatus.REJECTED);
        long pending = requestRepository.countByProviderAndStatus(provider, RequestStatus.SUBMITTED);
        long info = requestRepository.countByProviderAndStatus(provider, RequestStatus.INFO_REQUESTED);

        List<RequestDetailsResponse> recents = requestRepository.findAllByProviderOrderByCreatedAtDesc(provider)
                .stream()
                .limit(10)
                .map(r -> new RequestDetailsResponse(r, null))
                .collect(Collectors.toList());

        return new ProviderDashboardStats(total, approved, rejected, pending, info, recents);
    }

    public PayerDashboardStats getPayerDashboardStats(User payer) {
        long pending = requestRepository.countByPayerAndStatus(payer, RequestStatus.SUBMITTED);
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long approvedToday = requestRepository.countByPayerAndStatusAndUpdatedAtAfter(payer, RequestStatus.APPROVED, startOfDay);
        long rejectedToday = requestRepository.countByPayerAndStatusAndUpdatedAtAfter(payer, RequestStatus.REJECTED, startOfDay);
        
        long totalProcessed = requestRepository.countByPayer(payer) - pending;

        List<RequestDetailsResponse> queue = requestRepository.findAllByPayerOrderByCreatedAtDesc(payer)
                .stream()
                .filter(r -> r.getStatus() == RequestStatus.SUBMITTED)
                .map(r -> new RequestDetailsResponse(r, null))
                .collect(Collectors.toList());

        return new PayerDashboardStats(pending, approvedToday, rejectedToday, totalProcessed, queue);
    }

    public List<User> getRegisteredPayers() {
        try {
            String cachedPayers = redisService.get("cache:payers");
            if (cachedPayers != null && !cachedPayers.isEmpty()) {
                return objectMapper.readValue(cachedPayers, objectMapper.getTypeFactory().constructCollectionType(List.class, User.class));
            }
        } catch (Exception e) {
            System.err.println("Payer cache read failed: " + e.getMessage());
        }

        List<User> payers = userRepository.findByRole(UserRole.PAYER);
        
        try {
            String serialized = objectMapper.writeValueAsString(payers);
            redisService.set("cache:payers", serialized, 3600); // Cache for 1 hour
        } catch (Exception e) {
            System.err.println("Payer cache write failed: " + e.getMessage());
        }

        return payers;
    }

    private void mapDtoToEntity(CreateRequestDto dto, AuthorizationRequest request) {
        request.setPatientFirstName(dto.getPatientFirstName());
        request.setPatientLastName(dto.getPatientLastName());
        request.setPatientDob(dto.getPatientDob());
        request.setPatientGender(dto.getPatientGender());
        request.setPatientPhone(dto.getPatientPhone());
        request.setPatientEmail(dto.getPatientEmail());
        request.setPatientAddress(dto.getPatientAddress());
        request.setInsurancePolicyNumber(dto.getInsurancePolicyNumber());
        request.setInsuranceGroupNumber(dto.getInsuranceGroupNumber());
        request.setSubscriberName(dto.getSubscriberName());
        request.setSubscriberRelationship(dto.getSubscriberRelationship());
        request.setCoverageStartDate(dto.getCoverageStartDate());
        request.setCoverageEndDate(dto.getCoverageEndDate());
        request.setPrimaryDiagnosisCode(dto.getPrimaryDiagnosisCode());
        request.setPrimaryDiagnosisDesc(dto.getPrimaryDiagnosisDesc());
        request.setSecondaryDiagnosisCode(dto.getSecondaryDiagnosisCode());
        request.setSecondaryDiagnosisDesc(dto.getSecondaryDiagnosisDesc());
        request.setProcedureCode(dto.getProcedureCode());
        request.setProcedureDescription(dto.getProcedureDescription());
        request.setEstimatedCost(dto.getEstimatedCost());
        request.setServiceDate(dto.getServiceDate());
        request.setUrgency(dto.getUrgency());
        request.setPlaceOfService(dto.getPlaceOfService());
        request.setClinicalNotes(dto.getClinicalNotes());
    }

    private void saveStatusHistory(AuthorizationRequest request, RequestStatus from, RequestStatus to, User changedBy, String remarks) {
        StatusHistory history = new StatusHistory();
        history.setRequest(request);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setChangedBy(changedBy);
        history.setRemarks(remarks);
        statusHistoryRepository.save(history);
    }

    private void sendSubmissionNotifications(AuthorizationRequest req) {
        String title = "New Authorization Request: REQ-" + req.getId();
        String message = String.format("A new prior authorization request #REQ-%d has been submitted by %s for patient %s %s.",
                req.getId(), req.getProvider().getOrganizationName(), req.getPatientFirstName(), req.getPatientLastName());
        notificationService.createNotification(req.getPayer(), req, title, message, NotificationType.SUBMISSION);
    }

    private void sendPayerDecisionNotifications(AuthorizationRequest req, String remarks) {
        String title = "Request Update: REQ-" + req.getId();
        String statusText = req.getStatus().name();
        String message = String.format("Your prior authorization request #REQ-%d has been updated to %s by %s. Remarks: %s",
                req.getId(), statusText, req.getPayer().getOrganizationName(), remarks != null ? remarks : "N/A");
        
        NotificationType type = NotificationType.INFO_REQUEST;
        if (req.getStatus() == RequestStatus.APPROVED) {
            type = NotificationType.APPROVAL;
        } else if (req.getStatus() == RequestStatus.REJECTED) {
            type = NotificationType.REJECTION;
        }
        
        notificationService.createNotification(req.getProvider(), req, title, message, type);
    }

    @Transactional
    public void regenerateFhirBundle(Long requestId) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        try {
            List<Document> docs = documentRepository.findByRequest(request);
            String fhirJson = fhirService.generateFhirBundle(request, docs);
            request.setFhirBundleJson(fhirJson);
            requestRepository.save(request);
        } catch (Exception e) {
            System.err.println("Failed to regenerate FHIR Bundle: " + e.getMessage());
        }
    }
}
