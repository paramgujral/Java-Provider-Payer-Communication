package com.healthconn.healthcare_connector.fhir;

import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Validates incoming FHIR JSON before mapping to business DTOs.
 */
@Component
public class FhirValidator {

    public void requireResourceType(Map<String, Object> resource, String expectedType) {
        if (resource == null) {
            throw new IllegalArgumentException("FHIR resource body is required");
        }
        Object type = resource.get("resourceType");
        if (type == null || !expectedType.equals(String.valueOf(type))) {
            throw new IllegalArgumentException(
                    "Expected resourceType '" + expectedType + "' but got '" + type + "'");
        }
    }

    public void requireParameter(Map<String, Object> parameters, String name) {
        if (findParameterValue(parameters, name) == null) {
            throw new IllegalArgumentException("Missing FHIR parameter: " + name);
        }
    }

    @SuppressWarnings("unchecked")
    public Object findParameterValue(Map<String, Object> parameters, String name) {
        Object raw = parameters.get("parameter");
        if (!(raw instanceof Iterable)) {
            return null;
        }
        for (Object item : (Iterable<?>) raw) {
            if (!(item instanceof Map)) {
                continue;
            }
            Map<String, Object> param = (Map<String, Object>) item;
            if (name.equals(param.get("name"))) {
                if (param.containsKey("valueString")) {
                    return param.get("valueString");
                }
                if (param.containsKey("valueCode")) {
                    return param.get("valueCode");
                }
                if (param.containsKey("valueBoolean")) {
                    return param.get("valueBoolean");
                }
                return param.get("value");
            }
        }
        return null;
    }
}
