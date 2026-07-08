@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN','MANAGER')")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(currentUser.getId()));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                Map.of("count", notificationService.getUnreadCount(currentUser.getId())));
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("hasAnyRole('PROVIDER','PAYER','ADMIN','MANAGER')")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal User currentUser) {
        notificationService.markAllRead(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
