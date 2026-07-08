@RestController
@RequestMapping("/api/payer")
@RequiredArgsConstructor
public class PayerController {

    private final PayerService payerService;

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN')")
    public ResponseEntity<List<AuthRequestResponseDto>> getPendingRequests() {
        return ResponseEntity.ok(payerService.getPendingRequests());
    }

    @PutMapping("/requests/{id}/review")
    @PreAuthorize("hasRole('PAYER')")
    public ResponseEntity<AuthRequestResponseDto> reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequestDto dto,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(payerService.reviewRequest(id, dto, currentUser.getId()));
    }

    @GetMapping("/requests/all")
    @PreAuthorize("hasAnyRole('PAYER','ADMIN','MANAGER')")
    public ResponseEntity<List<AuthRequestResponseDto>> getAllRequests() {
        return ResponseEntity.ok(payerService.getAllRequests());
    }
}
