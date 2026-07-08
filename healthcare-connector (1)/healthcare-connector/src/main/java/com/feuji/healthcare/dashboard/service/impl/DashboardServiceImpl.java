package com.feuji.healthcare.dashboard.service.impl;

import com.feuji.healthcare.authorization.enums.AuthorizationStatus;
import com.feuji.healthcare.authorization.repository.AuthorizationRepository;
import com.feuji.healthcare.dashboard.dto.DashboardSummaryDto;
import com.feuji.healthcare.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl
        implements DashboardService {

    private final AuthorizationRepository authorizationRepository;

    @Override
    public DashboardSummaryDto getSummary() {

        return DashboardSummaryDto.builder()
                .totalRequests(
                        authorizationRepository.count())
                .submittedRequests(
                        authorizationRepository.countByStatus(
                                AuthorizationStatus.SUBMITTED))
                .underReviewRequests(
                        authorizationRepository.countByStatus(
                                AuthorizationStatus.UNDER_REVIEW))
                .approvedRequests(
                        authorizationRepository.countByStatus(
                                AuthorizationStatus.APPROVED))
                .rejectedRequests(
                        authorizationRepository.countByStatus(
                                AuthorizationStatus.REJECTED))
                .build();
    }
}