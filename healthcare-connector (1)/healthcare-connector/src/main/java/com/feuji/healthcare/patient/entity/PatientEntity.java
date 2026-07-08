package com.feuji.healthcare.patient.entity;

import com.feuji.healthcare.common.entity.AuditEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientCode;

    private String firstName;

    private String lastName;

    private String gender;

    private LocalDate dateOfBirth;

    private String email;

    private String phoneNumber;

    private String policyNumber;

    private String insurancePlan;

    private Boolean active;
}
