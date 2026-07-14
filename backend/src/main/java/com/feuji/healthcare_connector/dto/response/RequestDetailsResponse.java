package com.feuji.healthcare_connector.dto.response;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.entity.Document;
import com.feuji.healthcare_connector.enums.PlaceOfService;
import com.feuji.healthcare_connector.enums.RequestStatus;
import com.feuji.healthcare_connector.enums.SubscriberRelationship;
import com.feuji.healthcare_connector.enums.Urgency;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class RequestDetailsResponse {
    private Long id;
    private Long providerId;
    private String providerName;
    private String providerOrganization;
    private Long payerId;
    private String payerName;
    private String payerOrganization;
    private RequestStatus status;
    private String patientFirstName;
    private String patientLastName;
    private LocalDate patientDob;
    private String patientGender;
    private String patientPhone;
    private String patientEmail;
    private String patientAddress;
    private String insurancePolicyNumber;
    private String insuranceGroupNumber;
    private String subscriberName;
    private SubscriberRelationship subscriberRelationship;
    private LocalDate coverageStartDate;
    private LocalDate coverageEndDate;
    private String primaryDiagnosisCode;
    private String primaryDiagnosisDesc;
    private String secondaryDiagnosisCode;
    private String secondaryDiagnosisDesc;
    private String procedureCode;
    private String procedureDescription;
    private BigDecimal estimatedCost;
    private LocalDate serviceDate;
    private Urgency urgency;
    private PlaceOfService placeOfService;
    private String clinicalNotes;
    private String payerRemarks;
    private String aiValidationNotes;
    private Integer aiQualityScore;
    private String fhirBundleJson;
    private List<DocumentDto> documents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class DocumentDto {
        private Long id;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private LocalDateTime uploadedAt;

        public DocumentDto() {}

        public DocumentDto(Document doc) {
            this.id = doc.getId();
            this.fileName = doc.getFileName();
            this.fileType = doc.getFileType();
            this.fileSize = doc.getFileSize();
            this.uploadedAt = doc.getUploadedAt();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

        public LocalDateTime getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    }

    public RequestDetailsResponse() {}

    public RequestDetailsResponse(AuthorizationRequest req, List<Document> docs) {
        this.id = req.getId();
        this.providerId = req.getProvider().getId();
        this.providerName = req.getProvider().getName();
        this.providerOrganization = req.getProvider().getOrganizationName();
        this.payerId = req.getPayer().getId();
        this.payerName = req.getPayer().getName();
        this.payerOrganization = req.getPayer().getOrganizationName();
        this.status = req.getStatus();
        this.patientFirstName = req.getPatientFirstName();
        this.patientLastName = req.getPatientLastName();
        this.patientDob = req.getPatientDob();
        this.patientGender = req.getPatientGender();
        this.patientPhone = req.getPatientPhone();
        this.patientEmail = req.getPatientEmail();
        this.patientAddress = req.getPatientAddress();
        this.insurancePolicyNumber = req.getInsurancePolicyNumber();
        this.insuranceGroupNumber = req.getInsuranceGroupNumber();
        this.subscriberName = req.getSubscriberName();
        this.subscriberRelationship = req.getSubscriberRelationship();
        this.coverageStartDate = req.getCoverageStartDate();
        this.coverageEndDate = req.getCoverageEndDate();
        this.primaryDiagnosisCode = req.getPrimaryDiagnosisCode();
        this.primaryDiagnosisDesc = req.getPrimaryDiagnosisDesc();
        this.secondaryDiagnosisCode = req.getSecondaryDiagnosisCode();
        this.secondaryDiagnosisDesc = req.getSecondaryDiagnosisDesc();
        this.procedureCode = req.getProcedureCode();
        this.procedureDescription = req.getProcedureDescription();
        this.estimatedCost = req.getEstimatedCost();
        this.serviceDate = req.getServiceDate();
        this.urgency = req.getUrgency();
        this.placeOfService = req.getPlaceOfService();
        this.clinicalNotes = req.getClinicalNotes();
        this.payerRemarks = req.getPayerRemarks();
        this.aiValidationNotes = req.getAiValidationNotes();
        this.aiQualityScore = req.getAiQualityScore();
        this.fhirBundleJson = req.getFhirBundleJson();
        this.createdAt = req.getCreatedAt();
        this.updatedAt = req.getUpdatedAt();
        if (docs != null) {
            this.documents = docs.stream().map(DocumentDto::new).collect(Collectors.toList());
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderOrganization() { return providerOrganization; }
    public void setProviderOrganization(String providerOrganization) { this.providerOrganization = providerOrganization; }

    public Long getPayerId() { return payerId; }
    public void setPayerId(Long payerId) { this.payerId = payerId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getPayerOrganization() { return payerOrganization; }
    public void setPayerOrganization(String payerOrganization) { this.payerOrganization = payerOrganization; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getPatientFirstName() { return patientFirstName; }
    public void setPatientFirstName(String patientFirstName) { this.patientFirstName = patientFirstName; }

    public String getPatientLastName() { return patientLastName; }
    public void setPatientLastName(String patientLastName) { this.patientLastName = patientLastName; }

    public LocalDate getPatientDob() { return patientDob; }
    public void setPatientDob(LocalDate patientDob) { this.patientDob = patientDob; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientAddress() { return patientAddress; }
    public void setPatientAddress(String patientAddress) { this.patientAddress = patientAddress; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceGroupNumber() { return insuranceGroupNumber; }
    public void setInsuranceGroupNumber(String insuranceGroupNumber) { this.insuranceGroupNumber = insuranceGroupNumber; }

    public String getSubscriberName() { return subscriberName; }
    public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }

    public SubscriberRelationship getSubscriberRelationship() { return subscriberRelationship; }
    public void setSubscriberRelationship(SubscriberRelationship subscriberRelationship) { this.subscriberRelationship = subscriberRelationship; }

    public LocalDate getCoverageStartDate() { return coverageStartDate; }
    public void setCoverageStartDate(LocalDate coverageStartDate) { this.coverageStartDate = coverageStartDate; }

    public LocalDate getCoverageEndDate() { return coverageEndDate; }
    public void setCoverageEndDate(LocalDate coverageEndDate) { this.coverageEndDate = coverageEndDate; }

    public String getPrimaryDiagnosisCode() { return primaryDiagnosisCode; }
    public void setPrimaryDiagnosisCode(String primaryDiagnosisCode) { this.primaryDiagnosisCode = primaryDiagnosisCode; }

    public String getPrimaryDiagnosisDesc() { return primaryDiagnosisDesc; }
    public void setPrimaryDiagnosisDesc(String primaryDiagnosisDesc) { this.primaryDiagnosisDesc = primaryDiagnosisDesc; }

    public String getSecondaryDiagnosisCode() { return secondaryDiagnosisCode; }
    public void setSecondaryDiagnosisCode(String secondaryDiagnosisCode) { this.secondaryDiagnosisCode = secondaryDiagnosisCode; }

    public String getSecondaryDiagnosisDesc() { return secondaryDiagnosisDesc; }
    public void setSecondaryDiagnosisDesc(String secondaryDiagnosisDesc) { this.secondaryDiagnosisDesc = secondaryDiagnosisDesc; }

    public String getProcedureCode() { return procedureCode; }
    public void setProcedureCode(String procedureCode) { this.procedureCode = procedureCode; }

    public String getProcedureDescription() { return procedureDescription; }
    public void setProcedureDescription(String procedureDescription) { this.procedureDescription = procedureDescription; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public PlaceOfService getPlaceOfService() { return placeOfService; }
    public void setPlaceOfService(PlaceOfService placeOfService) { this.placeOfService = placeOfService; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public String getPayerRemarks() { return payerRemarks; }
    public void setPayerRemarks(String payerRemarks) { this.payerRemarks = payerRemarks; }

    public String getAiValidationNotes() { return aiValidationNotes; }
    public void setAiValidationNotes(String aiValidationNotes) { this.aiValidationNotes = aiValidationNotes; }

    public Integer getAiQualityScore() { return aiQualityScore; }
    public void setAiQualityScore(Integer aiQualityScore) { this.aiQualityScore = aiQualityScore; }

    public String getFhirBundleJson() { return fhirBundleJson; }
    public void setFhirBundleJson(String fhirBundleJson) { this.fhirBundleJson = fhirBundleJson; }

    public List<DocumentDto> getDocuments() { return documents; }
    public void setDocuments(List<DocumentDto> documents) { this.documents = documents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
