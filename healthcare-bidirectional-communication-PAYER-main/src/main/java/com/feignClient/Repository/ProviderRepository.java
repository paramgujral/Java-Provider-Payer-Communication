package com.feignClient.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feignClient.Auth.Provider;

@Repository
public interface ProviderRepository
       extends JpaRepository<Provider, Long>{

}