package ai.authbridge.web.dto;

import ai.authbridge.copilot.CopilotReview;
import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.ClinicalDocument;
import ai.authbridge.domain.Enums.Priority;
import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.domain.Enums.Role;
import ai.authbridge.domain.TimelineEvent;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

/** Request/response DTOs for the authorization API. */
public final class RequestDtos {
    private RequestDtos() {}

    /** Inbound payload to create a draft or submit a new request. */
    public record CreateRequest(
            @NotBlank String serviceRequested,
            List<String> cptCodes,
            List<String> icd10Codes,
            Priority priority,
            String placeOfService,
            int requestedUnits,
            String patientName,
            String patientDob,
            String memberId,
            String providerOrg,
            String payerOrg,
            String submittedBy,
            String clinicalJustification,
            List<DocumentDto> documents,
            RequestStatus status // DRAFT or SUBMITTED
    ) {}

    public record DocumentDto(String id, String name, String type, long sizeKb, Instant uploadedAt) {
        static DocumentDto from(ClinicalDocument d) {
            return new DocumentDto(d.getId() == null ? null : d.getId().toString(),
                    d.getName(), d.getType(), d.getSizeKb(), d.getUploadedAt());
        }
    }

    public record TimelineDto(String id, Instant at, String actor, Role role, String action,
                              String note, RequestStatus fromStatus, RequestStatus toStatus) {
        static TimelineDto from(TimelineEvent e) {
            return new TimelineDto(e.getId() == null ? null : e.getId().toString(), e.getAt(), e.getActor(),
                    e.getRole(), e.getAction(), e.getNote(), e.getFromStatus(), e.getToStatus());
        }
    }

    /** Outbound view of a full request. */
    public record RequestView(
            String id, String referenceNo, RequestStatus status, Priority priority,
            String providerOrg, String payerOrg, String submittedBy, String assignedReviewer,
            String patientName, String patientDob, String memberId,
            String serviceRequested, List<String> cptCodes, List<String> icd10Codes,
            String placeOfService, int requestedUnits, String clinicalJustification, String decisionNote,
            List<DocumentDto> documents, CopilotReview copilot, List<TimelineDto> timeline,
            Instant createdAt, Instant updatedAt
    ) {
        public static RequestView from(AuthorizationRequest r, CopilotReview copilot) {
            return new RequestView(
                    r.getId().toString(), r.getReferenceNo(), r.getStatus(), r.getPriority(),
                    r.getProviderOrg(), r.getPayerOrg(), r.getSubmittedBy(), r.getAssignedReviewer(),
                    r.getPatientName(), r.getPatientDob(), r.getMemberId(),
                    r.getServiceRequested(), r.getCptCodes(), r.getIcd10Codes(),
                    r.getPlaceOfService(), r.getRequestedUnits(), r.getClinicalJustification(), r.getDecisionNote(),
                    r.getDocuments().stream().map(DocumentDto::from).toList(), copilot,
                    r.getTimeline().stream().map(TimelineDto::from).toList(),
                    r.getCreatedAt(), r.getUpdatedAt());
        }
    }

    /** Inbound payload for a workflow action. */
    public record WorkflowAction(String action, RequestStatus to, String note, String reviewer, Actor actor) {
        public record Actor(String name, Role role) {}
    }
}
