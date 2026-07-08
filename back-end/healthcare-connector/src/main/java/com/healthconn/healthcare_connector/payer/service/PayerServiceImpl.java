@Service
@RequiredArgsConstructor
public class PayerServiceImpl implements PayerService {

    private final AuthorizationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<AuthRequestResponseDto> getPendingRequests() {
        return requestRepository
                .findByStatusInOrderByCreatedAtDesc(
                        List.of(RequestStatus.SUBMITTED, RequestStatus.UNDER_REVIEW))
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public AuthRequestResponseDto reviewRequest(Long requestId,
                                                ReviewRequestDto dto,
                                                Long payerId) {
        AuthorizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found: " + requestId));

        if (request.getStatus() != RequestStatus.SUBMITTED
                && request.getStatus() != RequestStatus.UNDER_REVIEW) {
            throw new RuntimeException("Request already finalized");
        }

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));

        request.setStatus(dto.decision());
        request.setReviewNotes(dto.reviewNotes());
        request.setRejectionReason(dto.rejectionReason());
        request.setReviewedBy(payer);
        request.setReviewedAt(LocalDateTime.now());

        AuthorizationRequest updated = requestRepository.save(request);

        notificationService.notifyProviderDecision(updated);

        return toDto(updated);
    }

    @Override
    public List<AuthRequestResponseDto> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).toList();
    }

    private AuthRequestResponseDto toDto(AuthorizationRequest r) {
        return new AuthRequestResponseDto(
                r.getId(), r.getPatientName(), r.getPatientId(),
                r.getInsuranceId(), r.getProvider().getFullName(), r.getProvider().getId(),
                r.getDiagnosisCode(), r.getProcedureCode(), r.getTreatmentDescription(),
                r.getAdmissionDate(), r.getExpectedDischargeDate(),
                r.getPriority(), r.getStatus(),
                r.getRejectionReason(), r.getReviewNotes(),
                r.getCreatedAt(), r.getReviewedAt(),
                r.getProvider().getFhirResourceId() 
        );
    }
}
