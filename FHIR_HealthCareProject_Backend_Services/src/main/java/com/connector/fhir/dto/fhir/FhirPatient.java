package com.connector.fhir.dto.fhir;

import java.util.List;

public class FhirPatient {
    private String resourceType = "Patient";
    private String id;
    private List<Name> name;
    private String gender;
    private String birthDate;

    public static class Name {
        private String use;
        private String family;
        private List<String> given;

        public Name() {}

        public Name(String family, List<String> given) {
            this.family = family;
            this.given = given;
            this.use = "official";
        }

        public String getUse() { return use; }
        public void setUse(String use) { this.use = use; }
        public String getFamily() { return family; }
        public void setFamily(String family) { this.family = family; }
        public List<String> getGiven() { return given; }
        public void setGiven(List<String> given) { this.given = given; }
    }

    public FhirPatient() {}

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<Name> getName() { return name; }
    public void setName(List<Name> name) { this.name = name; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
}
