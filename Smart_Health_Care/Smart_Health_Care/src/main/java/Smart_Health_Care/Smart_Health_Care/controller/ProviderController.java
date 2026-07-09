package Smart_Health_Care.Smart_Health_Care.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Smart_Health_Care.Smart_Health_Care.entity.AuthorizationRequest;
import Smart_Health_Care.Smart_Health_Care.service.AuthorizationService;

@RestController
@RequestMapping("/provider")
public class ProviderController {
	@Autowired
	private AuthorizationService service;
	
	@PostMapping("/submit")
	public AuthorizationRequest submit(@RequestBody AuthorizationRequest request) {
		
		return service.submitAuthorization(request);
	}

}
