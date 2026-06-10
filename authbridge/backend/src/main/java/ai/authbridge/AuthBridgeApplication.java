package ai.authbridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * AuthBridge — AI-powered prior authorization platform.
 *
 * <p>Modular monolith: the {@code provider}, {@code payer}, {@code copilot}, {@code workflow},
 * and {@code notification} concerns are separate packages with clear boundaries, deployable as
 * one unit today and extractable into microservices later (see ARCHITECTURE.md).
 */
@SpringBootApplication
public class AuthBridgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthBridgeApplication.class, args);
    }
}
