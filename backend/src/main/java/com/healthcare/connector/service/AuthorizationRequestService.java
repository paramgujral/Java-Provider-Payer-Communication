package com.healthcare.connector.service;

import com.healthcare.connector.dto.AuthorizationRequestDto;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.mapper.AuthorizationRequestMapper;
import com.healthcare.connector.entity.RequestStatus;
import com.healthcare.connector.entity.StatusHistory;
import com.healthcare.connector.repository.AuthorizationRequestRepository;
import com.healthcare.connector.repository.StatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthorizationRequestService {

	private final AuthorizationRequestRepository requestRepository;
	private final StatusHistoryRepository statusHistoryRepository;
	private final AuthorizationRequestMapper requestMapper;

	public AuthorizationRequestService(AuthorizationRequestRepository requestRepository,
			StatusHistoryRepository statusHistoryRepository, AuthorizationRequestMapper requestMapper) {
		this.requestRepository = requestRepository;
		this.statusHistoryRepository = statusHistoryRepository;
		this.requestMapper = requestMapper;
	}

	public AuthorizationRequestDto createRequest(AuthorizationRequestDto requestDto) {
		AuthorizationRequest request = requestMapper.toEntity(requestDto);
		request.setStatus(RequestStatus.DRAFT);
		return requestMapper.toDto(requestRepository.save(request));
	}

	@Transactional
	public AuthorizationRequestDto updateStatus(Long requestId, RequestStatus newStatus, Long changedBy) {
		AuthorizationRequest request = requestRepository.findById(requestId).orElseThrow();
		RequestStatus oldStatus = request.getStatus();
		request.setStatus(newStatus);

		StatusHistory history = StatusHistory.builder().requestId(requestId).oldStatus(oldStatus).newStatus(newStatus)
				.changedBy(changedBy).build();
		statusHistoryRepository.save(history);

		return requestMapper.toDto(requestRepository.save(request));
	}

	public List<AuthorizationRequestDto> getRequestsByProvider(Long requestId) {
		return requestRepository.findByRequestId(requestId).stream().map(requestMapper::toDto).toList();
	}

	public List<AuthorizationRequestDto> getRequestsByPayer(Long payerId) {
		return requestRepository.findByPayerId(payerId).stream().map(requestMapper::toDto).toList();
	}

	public AuthorizationRequestDto getRequestById(Long id) {
		return requestMapper.toDto(requestRepository.findById(id).orElseThrow());
	}

	public List<AuthorizationRequestDto> getAllRequests() {
		return requestRepository.findAll().stream().map(requestMapper::toDto).toList();
	}

	public AuthorizationRequestDto updateRequest(Long requestId, AuthorizationRequestDto requestDto) {

		AuthorizationRequest request = requestRepository.findById(requestId)
				.orElseThrow(() -> new RuntimeException("Request not found"));

		request.setPatientName(requestDto.getPatientName());
		request.setPatientId(requestDto.getPatientId());
		request.setInsuranceId(requestDto.getInsuranceId());
		request.setInsuranceProvider(requestDto.getInsuranceProvider());
		request.setDiagnosis(requestDto.getDiagnosis());
		request.setProcedureName(requestDto.getProcedureName());
		request.setClinicalNotes(requestDto.getClinicalNotes());
		request.setEstimatedCost(requestDto.getEstimatedCost());
		request.setStatus(RequestStatus.valueOf(requestDto.getStatus().trim().toUpperCase().replace(" ", "_")));

		AuthorizationRequest updatedRequest = requestRepository.save(request);

		return requestMapper.toDto(updatedRequest);
	}
}
