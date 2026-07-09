package Smart_Health_Care.Smart_Health_Care.service;

import java.util.List;

import Smart_Health_Care.Smart_Health_Care.entity.StatusTracking;

public interface StatusTrackingService {

    StatusTracking saveStatus(StatusTracking status);

    List<StatusTracking> getStatusByReferenceId(Long referenceId);

    List<StatusTracking> getAllStatus();
}