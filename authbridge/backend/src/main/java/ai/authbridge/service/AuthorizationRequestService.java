package ai.authbridge.service;

import ai.authbridge.copilot.CopilotReview;
import ai.authbridge.copilot.CopilotService;
import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.ClinicalDocument;
import ai.authbridge.domain.Enums.NotificationChannel;
import ai.authbridge.domain.Enums.Priority;
import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.domain.Enums.Role;
import ai.authbridge.domain.TimelineEvent;
import ai.authbridge.notification.NotificationService;
import ai.authbridge.repository.Repositories.AuthorizationRequestRepository;
import ai.authbridge.web.dto.RequestDtos.CreateRequest;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Application service for creating and querying authorization requests. */
@Service
public class AuthorizationRequestService {

    private final AuthorizationRequestRepository repo;
    private final CopilotService copilot;
    private final NotificationService notifications;
    private final AtomicLong seq = new AtomicLong(1000);

    public AuthorizationRequestService(AuthorizationRequestRepository repo, CopilotService copilot,
                                       NotificationService notifications) {
        this.repo = repo;
        this.copilot = copilot;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<AuthorizationRequest> list(RequestStatus status) {
        return status == null ? repo.findAll() : repo.findByStatusOrderByUpdatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public AuthorizationRequest get(UUID id) { return repo.findById(id).orElse(null); }

    /** Live copilot review without persistence — used by the pre-submission UI. */
    public CopilotReview preview(AuthorizationRequest draft) { return copilot.review(draft); }

    @Transactional
    public AuthorizationRequest create(CreateRequest in) {
        AuthorizationRequest r = new AuthorizationRequest();
        r.setReferenceNo("PA-2026-%05d".formatted(seq.incrementAndGet()));
        r.setStatus(in.status() == RequestStatus.SUBMITTED ? RequestStatus.SUBMITTED : RequestStatus.DRAFT);
        r.setPriority(in.priority() == null ? Priority.ROUTINE : in.priority());
        r.setProviderOrg(in.providerOrg());
        r.setPayerOrg(in.payerOrg());
        r.setSubmittedBy(in.submittedBy());
        r.setPatientName(in.patientName());
        r.setPatientDob(in.patientDob());
        r.setMemberId(in.memberId());
        r.setServiceRequested(in.serviceRequested());
        if (in.cptCodes() != null) r.setCptCodes(in.cptCodes());
        if (in.icd10Codes() != null) r.setIcd10Codes(in.icd10Codes());
        r.setPlaceOfService(in.placeOfService());
        r.setRequestedUnits(in.requestedUnits());
        r.setClinicalJustification(in.clinicalJustification());

        if (in.documents() != null) {
            in.documents().forEach(d -> {
                ClinicalDocument doc = new ClinicalDocument();
                doc.setName(d.name());
                doc.setType(d.type());
                doc.setSizeKb(d.sizeKb());
                r.addDocument(doc);
            });
        }

        r.addEvent(TimelineEvent.of(in.submittedBy() != null ? in.submittedBy() : "Provider", Role.PROVIDER, "Created draft"));
        if (r.getStatus() == RequestStatus.SUBMITTED) {
            r.addEvent(TimelineEvent.of(in.submittedBy() != null ? in.submittedBy() : "Provider", Role.PROVIDER, "Submitted to payer")
                    .withTransition(RequestStatus.DRAFT, RequestStatus.SUBMITTED));
        }

        AuthorizationRequest saved = repo.save(r);
        if (saved.getStatus() == RequestStatus.SUBMITTED) {
            notifications.notify(Role.PAYER, saved, "New authorization request",
                    saved.getServiceRequested() + " submitted by " + saved.getProviderOrg(), NotificationChannel.IN_APP);
        }
        return saved;
    }

    /** Provider edit flow: update editable fields, re-review, append an audit event. */
    @Transactional
    public AuthorizationRequest update(UUID id, CreateRequest in) {
        AuthorizationRequest r = repo.findById(id).orElse(null);
        if (r == null) return null;
        r.setServiceRequested(in.serviceRequested());
        if (in.cptCodes() != null) r.setCptCodes(in.cptCodes());
        if (in.icd10Codes() != null) r.setIcd10Codes(in.icd10Codes());
        if (in.priority() != null) r.setPriority(in.priority());
        r.setPlaceOfService(in.placeOfService());
        r.setRequestedUnits(in.requestedUnits());
        r.setPatientName(in.patientName());
        r.setPatientDob(in.patientDob());
        r.setMemberId(in.memberId());
        if (in.payerOrg() != null) r.setPayerOrg(in.payerOrg());
        r.setClinicalJustification(in.clinicalJustification());

        r.getDocuments().clear(); // orphanRemoval handles deletion
        if (in.documents() != null) {
            in.documents().forEach(d -> {
                ClinicalDocument doc = new ClinicalDocument();
                doc.setName(d.name());
                doc.setType(d.type());
                doc.setSizeKb(d.sizeKb());
                r.addDocument(doc);
            });
        }
        r.addEvent(TimelineEvent.of(r.getSubmittedBy() != null ? r.getSubmittedBy() : "Provider",
                Role.PROVIDER, "Edited request"));
        return repo.save(r);
    }

    public CopilotReview reviewOf(AuthorizationRequest r) { return copilot.review(r); }
}
