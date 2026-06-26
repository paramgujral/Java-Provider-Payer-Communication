package com.connector.fhir.service;

import com.connector.fhir.model.User;
import com.connector.fhir.model.Patient;
import com.connector.fhir.model.Coverage;
import com.connector.fhir.repository.UserRepository;
import com.connector.fhir.repository.PatientRepository;
import com.connector.fhir.repository.CoverageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final CoverageRepository coverageRepository;

    public UserService(UserRepository userRepository, PatientRepository patientRepository, CoverageRepository coverageRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.coverageRepository = coverageRepository;
    }

    @PostConstruct
    public void seedDatabase() {
        // Seed Users
        if (userRepository.findByEmail("provider@connector.com").isEmpty()) {
            User provider = new User(null, "Dr. Sarah Jenkins", "provider@connector.com", "password", "ROLE_PROVIDER");
            userRepository.save(provider);
        }
        if (userRepository.findByEmail("payer@connector.com").isEmpty()) {
            User payer = new User(null, "Aetna Insurance Reviewer", "payer@connector.com", "password", "ROLE_PAYER");
            userRepository.save(payer);
        }
        if (userRepository.findByEmail("patient@connector.com").isEmpty()) {
            User patient = new User(null, "Patient John Doe", "patient@connector.com", "password", "ROLE_PATIENT");
            userRepository.save(patient);
        }

        // Seed Patients
        Patient john = null;
        Optional<Patient> optJohn = patientRepository.findByFhirId("pat-101");
        if (optJohn.isEmpty()) {
            john = new Patient();
            john.setFirstName("John");
            john.setLastName("Doe");
            john.setGender("male");
            john.setBirthDate(LocalDate.of(1980, 5, 15));
            john.setEmail("john.doe@patient.com");
            john.setPhone("555-0199");
            john.setFhirId("pat-101");
            john = patientRepository.save(john);
        } else {
            john = optJohn.get();
        }

        Patient jane = null;
        Optional<Patient> optJane = patientRepository.findByFhirId("pat-102");
        if (optJane.isEmpty()) {
            jane = new Patient();
            jane.setFirstName("Jane");
            jane.setLastName("Smith");
            jane.setGender("female");
            jane.setBirthDate(LocalDate.of(1992, 11, 23));
            jane.setEmail("jane.smith@patient.com");
            jane.setPhone("555-0210");
            jane.setFhirId("pat-102");
            jane = patientRepository.save(jane);
        } else {
            jane = optJane.get();
        }

        // Seed Coverages
        if (coverageRepository.findByFhirId("cov-201").isEmpty() && john != null) {
            Coverage cov1 = new Coverage();
            cov1.setPatient(john);
            cov1.setSubscriberId("SUB-99201");
            cov1.setBeneficiaryId("BEN-99201-01");
            cov1.setStatus("active");
            cov1.setPayerName("Aetna PPO");
            cov1.setPlanDetails("Gold Plan Benefit with 10% copay");
            cov1.setFhirId("cov-201");
            coverageRepository.save(cov1);
        }

        if (coverageRepository.findByFhirId("cov-202").isEmpty() && jane != null) {
            Coverage cov2 = new Coverage();
            cov2.setPatient(jane);
            cov2.setSubscriberId("SUB-88102");
            cov2.setBeneficiaryId("BEN-88102-01");
            cov2.setStatus("active");
            cov2.setPayerName("BlueCross BlueShield");
            cov2.setPlanDetails("Standard PPO Plan");
            cov2.setFhirId("cov-202");
            coverageRepository.save(cov2);
        }
    }

    public Optional<User> authenticate(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> password.equals(user.getPassword()));
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
