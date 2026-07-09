package Smart_Health_Care.Smart_Health_Care.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Smart_Health_Care.Smart_Health_Care.entity.Claim;

@Repository
public interface ClaimRepository extends JpaRepository<Claim,Long>{

}
