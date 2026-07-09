package Smart_Health_Care.Smart_Health_Care.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.StatusTracking;
import Smart_Health_Care.Smart_Health_Care.repository.StatusTrackingRepository;
import Smart_Health_Care.Smart_Health_Care.service.StatusTrackingService;

@Service
public class StatusTrackingServiceImpl implements StatusTrackingService {

    private final StatusTrackingRepository repository;

    public StatusTrackingServiceImpl(StatusTrackingRepository repository) {
        this.repository = repository;
    }

    @Override
    public StatusTracking saveStatus(StatusTracking status) {

        status.setUpdatedDate(LocalDateTime.now());

        return repository.save(status);
    }

    @Override
    public List<StatusTracking> getStatusByReferenceId(Long referenceId) {

        return repository.findByReferenceId(referenceId);
    }

    @Override
    public List<StatusTracking> getAllStatus() {

        return repository.findAll();
    }

}