package Smart_Health_Care.Smart_Health_Care.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "fhir_patient")
public class FHIRPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;

    private String firstName;

    private String lastName;

    private String gender;

    private String phoneNumber;

    private String address;

    public FHIRPatient() {
    }

    public FHIRPatient(Long patientId, String firstName, String lastName,
                       String gender, String phoneNumber, String address) {
        this.patientId = patientId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.address = address;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}