package com.feignClient.Controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.feignClient.Auth.AuthorizationRequest;
import com.feignClient.Service.AuthorizationRequestService;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthorizationRequestController {

    @Autowired
    private AuthorizationRequestService service;

    @PostMapping("/create")
    public ResponseEntity<AuthorizationRequest> create(
            @RequestBody AuthorizationRequest req) {

        AuthorizationRequest response = service.createRequest(req);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public List<AuthorizationRequest> getAllRequests() {

        return service.getAllRequests();
    }
    
    

}
