package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.AuthorizationRequestDto;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.entity.RequestStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface AuthorizationRequestMapper {

	@Mapping(source = "requestId", target = "id")
	@Mapping(source = "status", target = "status", qualifiedByName = "mapRequestStatusToString")
	AuthorizationRequestDto toDto(AuthorizationRequest entity);

	@Mapping(source = "id", target = "requestId")
	@Mapping(source = "status", target = "status", qualifiedByName = "mapStringToRequestStatus")
	AuthorizationRequest toEntity(AuthorizationRequestDto dto);

	@Named("mapRequestStatusToString")
	default String mapRequestStatusToString(RequestStatus status) {
		if (status == null) {
			return null;
		}

		return switch (status) {
		case DRAFT -> "Draft";
		case SUBMITTED -> "Submitted";
		case PENDING -> "Pending";
		case PENDING_REVIEW -> "Pending Review";
		case UNDER_REVIEW -> "Under Review";
		case MORE_INFO_REQUIRED -> "More Info Required";
		case APPROVED -> "Approved";
		case REJECTED -> "Rejected";
		default -> status.name();
		};
	}

	@Named("mapStringToRequestStatus")
	default RequestStatus mapStringToRequestStatus(String status) {
		if (status == null) {
			return null;
		}

		return switch (status) {
		case "Draft" -> RequestStatus.DRAFT;
		case "Submitted" -> RequestStatus.SUBMITTED;
		case "Pending Review" -> RequestStatus.UNDER_REVIEW;
		case "Additional Information Required" -> RequestStatus.MORE_INFO_REQUIRED;
		case "Approved" -> RequestStatus.APPROVED;
		case "Rejected" -> RequestStatus.REJECTED;
		default -> RequestStatus.valueOf(status.toUpperCase().replace(" ", "_"));
		};
	}
}