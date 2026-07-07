package com.healthconnect.common.fhir;

/** FHIR code-system and identifier constants. */
public final class FhirNames {

    public static final String ICD10_SYSTEM = "http://hl7.org/fhir/sid/icd-10-cm";
    public static final String CPT_SYSTEM = "http://www.ama-assn.org/go/cpt";
    public static final String NPI_SYSTEM = "http://hl7.org/fhir/sid/us-npi";
    public static final String CLAIM_TYPE_SYSTEM = "http://terminology.hl7.org/CodeSystem/claim-type";
    public static final String PROCESS_PRIORITY_SYSTEM = "http://terminology.hl7.org/CodeSystem/processpriority";
    public static final String CLAIM_INFO_CATEGORY_SYSTEM = "http://terminology.hl7.org/CodeSystem/claiminformationcategory";

    public static final String REQUEST_NUMBER_SYSTEM = "urn:healthconnect:request-number";
    public static final String MEMBER_ID_SYSTEM = "urn:healthconnect:member-id";
    public static final String SUPPORTING_INFO_SYSTEM = "urn:healthconnect:supporting-info";
    public static final String URGENCY_CODE = "urgency";

    public static final String FHIR_JSON = "application/fhir+json";

    private FhirNames() {
    }
}
