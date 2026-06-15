package com.healthcare.service;

import com.healthcare.dto.MedicalCodeDto;
import com.healthcare.dto.PayerDto;
import com.healthcare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReferenceService {

    private final UserRepository userRepository;
    private final List<MedicalCodeDto> diagnosisCodes = new ArrayList<>();
    private final List<MedicalCodeDto> procedureCodes = new ArrayList<>();

    public ReferenceService(UserRepository userRepository) {
        this.userRepository = userRepository;
        
        // Mock ICD-10 Codes
        diagnosisCodes.add(new MedicalCodeDto("A00.0", "Cholera due to Vibrio cholerae 01, biovar cholerae"));
        diagnosisCodes.add(new MedicalCodeDto("A09", "Infectious gastroenteritis and colitis, unspecified"));
        diagnosisCodes.add(new MedicalCodeDto("E11.9", "Type 2 diabetes mellitus without complications"));
        diagnosisCodes.add(new MedicalCodeDto("I10", "Essential (primary) hypertension"));
        diagnosisCodes.add(new MedicalCodeDto("J01.90", "Acute sinusitis, unspecified"));
        diagnosisCodes.add(new MedicalCodeDto("J45.909", "Unspecified asthma, uncomplicated"));
        diagnosisCodes.add(new MedicalCodeDto("M54.5", "Low back pain"));
        diagnosisCodes.add(new MedicalCodeDto("R51.9", "Headache, unspecified"));
        diagnosisCodes.add(new MedicalCodeDto("Z00.00", "Encounter for general adult medical examination without abnormal findings"));
        diagnosisCodes.add(new MedicalCodeDto("Z01.419", "Encounter for gynecological examination (general) (routine) without abnormal findings"));

        // Mock CPT Codes
        procedureCodes.add(new MedicalCodeDto("99213", "Office or other outpatient visit for the evaluation and management of an established patient (Low complexity)"));
        procedureCodes.add(new MedicalCodeDto("99214", "Office or other outpatient visit for the evaluation and management of an established patient (Moderate complexity)"));
        procedureCodes.add(new MedicalCodeDto("70450", "Computed tomography, head or brain; without contrast material"));
        procedureCodes.add(new MedicalCodeDto("73221", "Magnetic resonance (eg, proton) imaging, any joint of upper extremity; without contrast material"));
        procedureCodes.add(new MedicalCodeDto("80053", "Comprehensive metabolic panel"));
        procedureCodes.add(new MedicalCodeDto("85025", "Blood count; complete (CBC), automated (Hgb, Hct, RBC, WBC and platelet count) and automated differential WBC count"));
        procedureCodes.add(new MedicalCodeDto("93000", "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report"));
        procedureCodes.add(new MedicalCodeDto("43239", "Esophagogastroduodenoscopy, flexible, transoral; with biopsy, single or multiple"));
        procedureCodes.add(new MedicalCodeDto("45380", "Colonoscopy, flexible; with biopsy, single or multiple"));
        procedureCodes.add(new MedicalCodeDto("29881", "Arthroscopy, knee, surgical; with meniscectomy (medial OR lateral)"));
    }

    public boolean isValidDiagnosisCode(String code) {
        if (code == null || code.trim().isEmpty()) return false;
        return diagnosisCodes.stream().anyMatch(c -> c.getCode().equalsIgnoreCase(code.trim()));
    }

    public boolean isValidProcedureCode(String code) {
        if (code == null || code.trim().isEmpty()) return false;
        return procedureCodes.stream().anyMatch(c -> c.getCode().equalsIgnoreCase(code.trim()));
    }

    public List<MedicalCodeDto> searchDiagnosisCodes(String query) {
        if (query == null || query.trim().isEmpty()) {
            return diagnosisCodes.stream().limit(5).collect(Collectors.toList());
        }
        String lowerQuery = query.toLowerCase();
        return diagnosisCodes.stream()
                .filter(code -> code.getCode().toLowerCase().contains(lowerQuery) || 
                                code.getDescription().toLowerCase().contains(lowerQuery))
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<MedicalCodeDto> searchProcedureCodes(String query) {
        if (query == null || query.trim().isEmpty()) {
            return procedureCodes.stream().limit(5).collect(Collectors.toList());
        }
        String lowerQuery = query.toLowerCase();
        return procedureCodes.stream()
                .filter(code -> code.getCode().toLowerCase().contains(lowerQuery) || 
                                code.getDescription().toLowerCase().contains(lowerQuery))
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<PayerDto> getPayers() {
        return userRepository.findByRole("PAYER").stream()
                .map(u -> new PayerDto(
                        u.getOrganizationId(), 
                        u.getFirstName() + " " + u.getLastName() + " (" + u.getOrganizationId() + ")"
                ))
                .collect(Collectors.toList());
    }
}
