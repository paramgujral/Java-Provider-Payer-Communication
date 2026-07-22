package com.healthconn.healthcare_connector.notification.controller;

import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.fhir.FhirMapper;
import com.healthconn.healthcare_connector.fhir.FhirMediaTypes;
import com.healthconn.healthcare_connector.fhir.FhirValidator;
import com.healthconn.healthcare_connector.notification.dto.NotificationDto;
import com.healthconn.healthcare_connector.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * FHIR Communication resources for notifications.
 */
@RestController
@RequestMapping(produces = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final FhirMapper fhirMapper;
    private final FhirValidator fhirValidator;

    @GetMapping("/fhir/Communication")
    public ResponseEntity<Map<String, Object>> getUserNotifications(
            @AuthenticationPrincipal User currentUser) {
        List<NotificationDto> notifications =
                notificationService.getUserNotifications(currentUser.getId());
        List<Map<String, Object>> entries = new ArrayList<Map<String, Object>>();
        for (NotificationDto notification : notifications) {
            entries.add(fhirMapper.toCommunication(notification));
        }
        return ResponseEntity.ok(fhirMapper.toBundle("searchset", entries));
    }

    @GetMapping("/fhir/Communication/$unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadNotificationCount(
            @AuthenticationPrincipal User currentUser) {
        long count = notificationService.countUnreadNotifications(currentUser.getId());
        Map<String, Object> parameters = new LinkedHashMap<String, Object>();
        parameters.put("resourceType", "Parameters");
        Map<String, Object> param = new LinkedHashMap<String, Object>();
        param.put("name", "count");
        param.put("valueInteger", count);
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        list.add(param);
        parameters.put("parameter", list);
        return ResponseEntity.ok(parameters);
    }

    @PutMapping(value = "/fhir/Communication/$mark-all-read",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> markNotificationsAsRead(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal User currentUser) {
        notificationService.markNotificationsAsRead(currentUser.getId());
        return ResponseEntity.ok(operationOutcome("All notifications marked as read"));
    }

    @PutMapping(value = "/fhir/Communication/{id}",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> markNotificationAsRead(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> communication,
            @AuthenticationPrincipal User currentUser) {
        fhirValidator.requireResourceType(communication, "Communication");
        Object bodyId = communication.get("id");
        if (bodyId != null && !String.valueOf(id).equals(String.valueOf(bodyId))) {
            throw new IllegalArgumentException("Path id and Communication.id must match");
        }
        notificationService.markNotificationAsRead(id, currentUser.getId());

        List<NotificationDto> notifications =
                notificationService.getUserNotifications(currentUser.getId());
        for (NotificationDto notification : notifications) {
            if (id.equals(notification.getId())) {
                return ResponseEntity.ok(fhirMapper.toCommunication(notification));
            }
        }
        return ResponseEntity.ok(operationOutcome("Communication/" + id + " marked as read"));
    }

    private Map<String, Object> operationOutcome(String diagnostics) {
        Map<String, Object> outcome = new LinkedHashMap<String, Object>();
        outcome.put("resourceType", "OperationOutcome");
        Map<String, Object> issue = new LinkedHashMap<String, Object>();
        issue.put("severity", "information");
        issue.put("code", "informational");
        issue.put("diagnostics", diagnostics);
        List<Map<String, Object>> issues = new ArrayList<Map<String, Object>>();
        issues.add(issue);
        outcome.put("issue", issues);
        return outcome;
    }
}
