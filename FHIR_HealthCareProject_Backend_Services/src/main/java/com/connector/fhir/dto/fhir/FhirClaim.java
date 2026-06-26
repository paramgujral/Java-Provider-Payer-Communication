package com.connector.fhir.dto.fhir;

import java.util.List;

public class FhirClaim {
    private String resourceType = "Claim";
    private String id;
    private String status = "active";
    private String use = "preauthorization";
    private Reference patient;
    private String created;
    private Reference provider;
    private Reference insurer;
    private List<Insurance> insurance;
    private List<Diagnosis> diagnosis;
    private List<Item> item;

    public static class Reference {
        private String reference;
        private String display;

        public Reference() {}
        public Reference(String reference, String display) {
            this.reference = reference;
            this.display = display;
        }

        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }
        public String getDisplay() { return display; }
        public void setDisplay(String display) { this.display = display; }
    }

    public static class Insurance {
        private Integer sequence;
        private Boolean focal;
        private Reference coverage;

        public Insurance() {}

        public Integer getSequence() { return sequence; }
        public void setSequence(Integer sequence) { this.sequence = sequence; }
        public Boolean getFocal() { return focal; }
        public void setFocal(Boolean focal) { this.focal = focal; }
        public Reference getCoverage() { return coverage; }
        public void setCoverage(Reference coverage) { this.coverage = coverage; }
    }

    public static class Diagnosis {
        private Integer sequence;
        private CodeableConcept diagnosisCodeableConcept;

        public Diagnosis() {}

        public Integer getSequence() { return sequence; }
        public void setSequence(Integer sequence) { this.sequence = sequence; }
        public CodeableConcept getDiagnosisCodeableConcept() { return diagnosisCodeableConcept; }
        public void setDiagnosisCodeableConcept(CodeableConcept diagnosisCodeableConcept) { this.diagnosisCodeableConcept = diagnosisCodeableConcept; }
    }

    public static class Item {
        private Integer sequence;
        private CodeableConcept productOrService;

        public Item() {}

        public Integer getSequence() { return sequence; }
        public void setSequence(Integer sequence) { this.sequence = sequence; }
        public CodeableConcept getProductOrService() { return productOrService; }
        public void setProductOrService(CodeableConcept productOrService) { this.productOrService = productOrService; }
    }

    public static class CodeableConcept {
        private List<Coding> coding;
        private String text;

        public CodeableConcept() {}

        public List<Coding> getCoding() { return coding; }
        public void setCoding(List<Coding> coding) { this.coding = coding; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class Coding {
        private String system;
        private String code;
        private String display;

        public Coding() {}
        public Coding(String system, String code, String display) {
            this.system = system;
            this.code = code;
            this.display = display;
        }

        public String getSystem() { return system; }
        public void setSystem(String system) { this.system = system; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getDisplay() { return display; }
        public void setDisplay(String display) { this.display = display; }
    }

    public FhirClaim() {}

    // Getters and Setters
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUse() { return use; }
    public void setUse(String use) { this.use = use; }
    public Reference getPatient() { return patient; }
    public void setPatient(Reference patient) { this.patient = patient; }
    public String getCreated() { return created; }
    public void setCreated(String created) { this.created = created; }
    public Reference getProvider() { return provider; }
    public void setProvider(Reference provider) { this.provider = provider; }
    public Reference getInsurer() { return insurer; }
    public void setInsurer(Reference insurer) { this.insurer = insurer; }
    public List<Insurance> getInsurance() { return insurance; }
    public void setInsurance(List<Insurance> insurance) { this.insurance = insurance; }
    public List<Diagnosis> getDiagnosis() { return diagnosis; }
    public void setDiagnosis(List<Diagnosis> diagnosis) { this.diagnosis = diagnosis; }
    public List<Item> getItem() { return item; }
    public void setItem(List<Item> item) { this.item = item; }
}
