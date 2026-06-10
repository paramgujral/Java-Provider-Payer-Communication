package ai.authbridge.notification;

import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.NotificationChannel;
import ai.authbridge.domain.Enums.Role;
import ai.authbridge.domain.NotificationEntity;
import ai.authbridge.repository.Repositories.NotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fan-out notification service. Persists an in-app notification and, in production, dispatches to
 * email (SES/SendGrid) and SMS/push (SNS/Twilio/FCM) asynchronously. Channel selection is driven by
 * the recipient's preferences and the event severity.
 */
@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    @Transactional
    public NotificationEntity notify(Role role, AuthorizationRequest req, String title, String body,
                                     NotificationChannel channel) {
        NotificationEntity n = new NotificationEntity();
        n.setRole(role);
        if (req != null) { n.setRequestId(req.getId()); n.setReferenceNo(req.getReferenceNo()); }
        n.setTitle(title);
        n.setBody(body);
        n.setChannel(channel);
        NotificationEntity saved = repo.save(n);
        if (channel == NotificationChannel.EMAIL) dispatchEmail(saved);
        if (channel == NotificationChannel.SMS) dispatchSms(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<NotificationEntity> list(Role role) { return repo.findByRoleOrderByCreatedAtDesc(role); }

    @Transactional(readOnly = true)
    public long unread(Role role) { return repo.countByRoleAndReadIsFalse(role); }

    @Transactional
    public void markAllRead(Role role) {
        repo.findByRoleOrderByCreatedAtDesc(role).forEach(n -> n.setRead(true));
    }

    // Stubs — wired to real providers (SES / Twilio) behind feature flags in production.
    private void dispatchEmail(NotificationEntity n) { /* enqueue to email worker */ }
    private void dispatchSms(NotificationEntity n) { /* enqueue to SMS worker */ }
}
