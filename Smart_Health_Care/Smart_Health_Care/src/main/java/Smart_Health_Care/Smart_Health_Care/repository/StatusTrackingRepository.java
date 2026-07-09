package Smart_Health_Care.Smart_Health_Care.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import Smart_Health_Care.Smart_Health_Care.entity.StatusTracking;

public interface StatusTrackingRepository extends JpaRepository<StatusTracking, Long> {

    List<StatusTracking> findByReferenceId(Long referenceId);

}