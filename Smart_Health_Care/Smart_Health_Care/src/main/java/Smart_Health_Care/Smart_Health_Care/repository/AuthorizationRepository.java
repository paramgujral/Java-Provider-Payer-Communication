package Smart_Health_Care.Smart_Health_Care.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import Smart_Health_Care.Smart_Health_Care.entity.AuthorizationRequest;

public interface AuthorizationRepository extends JpaRepository<AuthorizationRequest,Long>{
  
}
