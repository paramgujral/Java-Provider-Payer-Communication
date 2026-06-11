package com.healthcare.connector.service;

import com.healthcare.connector.dto.LoginRequest;
import com.healthcare.connector.entity.UserRole;
import com.healthcare.connector.dto.LoginResponse;
import com.healthcare.connector.entity.User;
import com.healthcare.connector.repository.UserRepository;
import com.healthcare.connector.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final UserRepository userRepository;
	private final JwtUtils jwtUtils;

	public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtUtils jwtUtils) {
		this.authenticationManager = authenticationManager;
		this.userRepository = userRepository;
		this.jwtUtils = jwtUtils;
	}

	public LoginResponse authenticateUser(LoginRequest loginRequest) {

		System.out.println("Username = " + loginRequest.getUsername());
	    System.out.println("Password = " + loginRequest.getPassword());
	    System.out.println("RoleName = " + loginRequest.getRoleName());

	    Authentication authentication = authenticationManager.authenticate(
	            new UsernamePasswordAuthenticationToken(
	                    loginRequest.getUsername(),
	                    loginRequest.getPassword()));

	    System.out.println("Authentication Success");
		SecurityContextHolder.getContext().setAuthentication(authentication);
//        String jwt = jwtUtils.generateJwtToken(authentication);

		User user = userRepository.findByUsername(loginRequest.getUsername())
				.filter(u -> u.getRole().name().equals(loginRequest.getRoleName()))
				.orElseThrow(() -> new RuntimeException("Invalid credentials or role"));

		String jwt = jwtUtils.generateJwtToken(user, loginRequest.getRoleId());

//		return new LoginResponse(jwt);
		return new LoginResponse(
			    jwt,
			    user.getUsername(),
			    user.getRole().name(),
			    loginRequest.getRoleId(),
			    user.getId(),
			    "Login successful"
			);
	}
}
