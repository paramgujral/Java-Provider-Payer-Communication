package com.healthconnect.provider.service;

import com.healthconnect.common.model.Urgency;
import com.healthconnect.provider.repository.AuthorizationRequestRepository;
import com.healthconnect.provider.web.dto.AuthorizationRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Seeds a few demo requests on first start. */
@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final AuthorizationRequestService service;
    private final AuthorizationRequestRepository requests;
    private final boolean enabled;

    public DemoDataSeeder(AuthorizationRequestService service,
                          AuthorizationRequestRepository requests,
                          @Value("${demo.seed:true}") boolean enabled) {
        this.service = service;
        this.requests = requests;
        this.enabled = enabled;
    }

    @Override
    public void run(String... args) {
        if (!enabled || requests.count() > 0) {
            return;
        }

        Long kneeId = service.create(new AuthorizationRequestDto(
                "Jane", "Doe", LocalDate.of(1968, 3, 14), "female", "MBR12345678",
                "Acme Health Insurance", "Gold PPO",
                "City General Hospital", "1234567893",
                "M17.11", "Unilateral primary osteoarthritis, right knee",
                "27447", "Total knee arthroplasty",
                LocalDate.now().plusWeeks(6), Urgency.ROUTINE,
                "Patient has failed 6 months of conservative therapy including physical therapy, NSAIDs and "
                        + "corticosteroid injections. Severe functional limitation: unable to climb stairs or walk "
                        + "more than 100 meters. Radiographs show Kellgren-Lawrence grade 4 changes.",
                new BigDecimal("32500.00"))).getId();

        Long mriId = service.create(new AuthorizationRequestDto(
                "Robert", "Smith", LocalDate.of(1979, 11, 2), "male", "MBR87654321",
                "Acme Health Insurance", "Silver HMO",
                "Riverside Neurology Clinic", "1245319599",
                "G43.909", "Migraine, unspecified, not intractable",
                "70551", "MRI brain without contrast",
                LocalDate.now().plusDays(10), Urgency.URGENT,
                "New-onset severe headaches with visual aura, worsening over 8 weeks despite triptan therapy. "
                        + "Neurological exam shows mild left-sided weakness — imaging needed to rule out "
                        + "structural pathology.",
                new BigDecimal("2400.00"))).getId();

        // incomplete draft, useful for trying the copilot
        service.create(new AuthorizationRequestDto(
                "Maria", null, LocalDate.of(1990, 7, 22), "female", "MB1",
                "Acme Health Insurance", "Bronze EPO",
                "Downtown Imaging Center", "1234567890",
                "K21.9", "Gastro-esophageal reflux disease",
                "27447", "Total knee arthroplasty",
                LocalDate.now().minusDays(3), Urgency.EMERGENCY,
                "Knee pain.",
                new BigDecimal("185000.00")));

        log.info("Seeded 3 demo authorization requests");
        autoSubmitInBackground(kneeId, mriId);
    }

    /** Submits the clean drafts once the payer service is reachable. */
    private void autoSubmitInBackground(Long... ids) {
        Thread thread = new Thread(() -> {
            for (int attempt = 1; attempt <= 15; attempt++) {
                try {
                    Thread.sleep(2000);
                    for (Long id : ids) {
                        service.submit(id);
                    }
                    log.info("Auto-submitted {} seeded requests to the payer", ids.length);
                    return;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                } catch (Exception e) {
                    log.debug("Payer not reachable yet (attempt {}): {}", attempt, e.getMessage());
                }
            }
            log.info("Payer service never became reachable — seeded requests remain as drafts");
        }, "demo-auto-submit");
        thread.setDaemon(true);
        thread.start();
    }
}
