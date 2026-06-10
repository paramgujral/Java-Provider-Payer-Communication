package com.feignClient.Service;


import java.util.List;

import com.feignClient.Auth.AuthorizationRequest;
import com.feignClient.dto.DashboardDto;


public interface AuthorizationRequestService {

	 AuthorizationRequest createRequest(AuthorizationRequest req);

	    List<AuthorizationRequest> getAllRequests();

	    AuthorizationRequest approveRequest(Long id);

	    AuthorizationRequest rejectRequest(Long id, String comment);
	    AuthorizationRequest resubmit(Long id, AuthorizationRequest updated);
	    
	    DashboardDto getDashboardStats();
}
