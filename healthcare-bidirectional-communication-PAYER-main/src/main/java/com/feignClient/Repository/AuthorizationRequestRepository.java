package com.feignClient.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feignClient.Auth.AuthorizationRequest;


@Repository
public interface AuthorizationRequestRepository
        extends JpaRepository<AuthorizationRequest, Long> {

}
