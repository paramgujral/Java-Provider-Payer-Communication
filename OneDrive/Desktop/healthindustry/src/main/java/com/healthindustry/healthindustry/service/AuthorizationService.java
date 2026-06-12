package com.healthindustry.healthindustry.service;

import com.healthindustry.healthindustry.dto.ValidationResponseDTO;
import com.healthindustry.healthindustry.dto.LoginResponseDTO;
import com.healthindustry.healthindustry.dto.LoginRequestDTO;
import com.healthindustry.healthindustry.dto.DashboardDTO;
import com.healthindustry.healthindustry.entity.AuthorizationRequest;
import com.healthindustry.healthindustry.entity.AuthorizationStatus;
import com.healthindustry.healthindustry.exception.ValidationException;
import com.healthindustry.healthindustry.repository.AuthorizationRequestRepository;
import com.healthindustry.healthindustry.repository.UserRepository;
import com.healthindustry.healthindustry.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorizationService {


    private final AuthorizationRequestRepository repository;
    private final UserRepository userRepository;

    public LoginResponseDTO login(
            LoginRequestDTO request) {

        User user =
                userRepository
                        .findByUsernameAndPassword(
                                request.getUsername(),
                                request.getPassword()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Invalid Credentials"
                                        )
                        );

        return LoginResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public ValidationResponseDTO reviewWithCopilot(
            AuthorizationRequest request) {

        List<String> recommendations =
                new ArrayList<>();

        if (request.getProviderId() == null) {

            recommendations.add(
                    "AI Suggestion: Provider ID is required.");
        }

        if (request.getPayerId() == null) {

            recommendations.add(
                    "AI Suggestion: Payer ID is required.");
        }

        if (request.getPatientName() == null ||
                request.getPatientName().isBlank()) {

            recommendations.add(
                    "AI Suggestion: Patient name is required.");
        }

        if (request.getInsuranceId() == null ||
                request.getInsuranceId().isBlank()) {

            recommendations.add(
                    "AI Suggestion: Missing Insurance ID.");
        }

        if (request.getDiagnosisCodes() == null ||
                request.getDiagnosisCodes().isBlank()) {

            recommendations.add(
                    "AI Suggestion: Missing ICD-10 diagnosis codes.");
        }

        if (request.getProcedureCodes() == null ||
                request.getProcedureCodes().isBlank()) {

            recommendations.add(
                    "AI Suggestion: Missing CPT procedure codes.");
        }

        boolean valid =
                recommendations.isEmpty();

        return ValidationResponseDTO.builder()
                .isValid(valid)
                .recommendations(recommendations)
                .build();
    }
    public DashboardDTO getPayerDashboard() {

        return DashboardDTO.builder()

                .submitted(repository.count())

                .pending(
                        repository.countByStatus(
                                AuthorizationStatus.PENDING))

                .approved(
                        repository.countByStatus(
                                AuthorizationStatus.APPROVED))

                .rejected(
                        repository.countByStatus(
                                AuthorizationStatus.REJECTED))

                .build();
    }

    public AuthorizationRequest submit(
            AuthorizationRequest request) {

        ValidationResponseDTO validation =
                reviewWithCopilot(request);

        if (!validation.isValid()) {

            throw new ValidationException(
                    String.join(
                            ", ",
                            validation.getRecommendations()));
        }

        request.setAiValidationNotes(
                "AI Validation Passed");

        request.setStatus(
                AuthorizationStatus.PENDING);

        request.setNotifiedProvider(false);

        return repository.save(request);
    }

    public List<AuthorizationRequest>
    getPendingRequests() {

        return repository.findByStatus(
                AuthorizationStatus.PENDING);
    }

    @Transactional
    public AuthorizationRequest updateStatus(
            Long id,
            AuthorizationStatus status) {

        if (status != AuthorizationStatus.APPROVED
                &&
                status != AuthorizationStatus.REJECTED) {

            throw new ValidationException(
                    "Only APPROVED or REJECTED status allowed");
        }

        AuthorizationRequest request =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ValidationException(
                                        "Authorization Request Not Found"));

        request.setStatus(status);

        return request;
    }

    @Transactional
    public List<AuthorizationRequest>
    getProviderNotifications(
            Long providerId) {

        List<AuthorizationRequest> requests =
                repository.findByProviderIdAndNotifiedProviderFalse(
                        providerId);

        List<AuthorizationRequest> result =
                requests.stream()
                        .filter(r ->
                                r.getStatus() ==
                                        AuthorizationStatus.APPROVED
                                        ||
                                        r.getStatus() ==
                                                AuthorizationStatus.REJECTED)
                        .toList();

        result.forEach(r ->
                r.setNotifiedProvider(true));

        return result;
    }
    public DashboardDTO getProviderDashboard(
            Long providerId) {

        return DashboardDTO.builder()

                .submitted(
                        repository.countByProviderId(
                                providerId))

                .pending(
                        repository.countByProviderIdAndStatus(
                                providerId,
                                AuthorizationStatus.PENDING))

                .approved(
                        repository.countByProviderIdAndStatus(
                                providerId,
                                AuthorizationStatus.APPROVED))

                .rejected(
                        repository.countByProviderIdAndStatus(
                                providerId,
                                AuthorizationStatus.REJECTED))

                .build();
    }

}
