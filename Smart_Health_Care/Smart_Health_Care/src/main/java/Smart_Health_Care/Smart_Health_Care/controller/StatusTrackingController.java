package Smart_Health_Care.Smart_Health_Care.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import Smart_Health_Care.Smart_Health_Care.entity.StatusTracking;
import Smart_Health_Care.Smart_Health_Care.service.StatusTrackingService;

@RestController
@RequestMapping("/tracking")
public class StatusTrackingController {

    @Autowired
    private StatusTrackingService statusTrackingService;

    @PostMapping
    public StatusTracking saveStatus(@RequestBody StatusTracking status) {
        return statusTrackingService.saveStatus(status);
    }

    @GetMapping("/{referenceId}")
    public List<StatusTracking> getStatusByReferenceId(
            @PathVariable Long referenceId) {

        return statusTrackingService.getStatusByReferenceId(referenceId);
    }

    @GetMapping("/all")
    public List<StatusTracking> getAllStatus() {
        return statusTrackingService.getAllStatus();
    }
}