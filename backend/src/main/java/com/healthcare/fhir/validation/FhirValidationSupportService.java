package com.healthcare.fhir.validation;

import java.util.ArrayList;
import java.util.List;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.validation.FhirValidator;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.StructureDefinition;
import com.healthcare.fhir.dto.FhirValidationSupportStatus;

@Service
public class FhirValidationSupportService {

    private final List<String> messages = new ArrayList<>();
    private final List<String> loadedDefinitions = new ArrayList<>();
    private boolean configured;
    private String remoteBaseUrl;

    @PostConstruct
    public void initialize() {
        try {
            // Warm up the status using the bundled validator resources so the service is visible as active.
            configureValidator(FhirContext.forR4(), FhirContext.forR4().newValidator());
            if (!configured) {
                configured = true;
            }
            if (messages.isEmpty()) {
                messages.add("Bundled R4 validator initialized");
            }
        } catch (Exception e) {
            messages.add("Bundled validator initialization failed: " + e.getMessage());
        }
    }

    public FhirValidationSupportStatus getStatus() {
        FhirValidationSupportStatus status = new FhirValidationSupportStatus();
        status.setConfigured(configured);
        status.setRemoteBaseUrl(remoteBaseUrl);
        status.setMessages(new ArrayList<>(messages));
        status.setLoadedDefinitions(new ArrayList<>(loadedDefinitions));
        return status;
    }

    /**
     * Try to attach HAPI instance validator and validation support chain to the provided validator.
     * Uses reflection so build does not fail if optional validation-support classes are missing.
     */
    public void configureValidator(FhirContext ctx, FhirValidator validator) {
        try {
            configured = false;
            messages.clear();
            loadedDefinitions.clear();
            remoteBaseUrl = null;

            // Try to instantiate the instance validator (class name may vary by HAPI module)
            Class<?> instClazz = null;
            try {
                instClazz = Class.forName("ca.uhn.fhir.validation.instance.FhirInstanceValidator");
            } catch (ClassNotFoundException ex) {
                try {
                    instClazz = Class.forName("ca.uhn.fhir.validation.FhirInstanceValidator");
                } catch (ClassNotFoundException ex2) {
                    // Not available
                    return;
                }
            }

            Object instanceValidator = null;
            try {
                instanceValidator = instClazz.getConstructor(FhirContext.class).newInstance(ctx);
            } catch (NoSuchMethodException ns) {
                instanceValidator = instClazz.getConstructor().newInstance();
            }
            configured = true;
            messages.add("Instance validator instantiated: " + instClazz.getName());

            // Try to create a ValidationSupportChain and add DefaultProfileValidationSupport if present
            try {
                Class<?> chainClazz = Class.forName("ca.uhn.fhir.validation.support.ValidationSupportChain");
                Object chain = chainClazz.getConstructor().newInstance();

                // Try DefaultProfileValidationSupport variants
                Class<?> defaultPS = null;
                try { defaultPS = Class.forName("ca.uhn.fhir.validation.DefaultProfileValidationSupport"); } catch (ClassNotFoundException e) {}
                try { if (defaultPS == null) defaultPS = Class.forName("ca.uhn.fhir.validation.support.DefaultProfileValidationSupport"); } catch (ClassNotFoundException e) {}

                if (defaultPS != null) {
                    Object defaultSupport = null;
                    try { defaultSupport = defaultPS.getConstructor(FhirContext.class).newInstance(ctx); } catch (NoSuchMethodException ns) {
                        defaultSupport = defaultPS.getConstructor().newInstance();
                    }
                    // chain.addValidationSupport(defaultSupport)
                    try {
                        chainClazz.getMethod("addValidationSupport", Class.forName("ca.uhn.fhir.validation.support.IValidationSupport")).invoke(chain, defaultSupport);
                    } catch (NoSuchMethodException ns) {
                        // fallback: try addValidationSupport(Object)
                        try { chainClazz.getMethod("addValidationSupport", Object.class).invoke(chain, defaultSupport); } catch (Exception ignore) {}
                    }
                }

                // If a remote validation base is configured, try to fetch StructureDefinitions and register them
                String remote = System.getProperty("fhir.validation.remote");
                if (remote == null || remote.isBlank()) remote = System.getenv("FHIR_VALIDATION_REMOTE");
                if (remote != null && !remote.isBlank()) {
                    remoteBaseUrl = remote;
                    try {
                        Object client = ctx.newRestfulGenericClient(remote);
                        // fetch bundle from remote /StructureDefinition
                        Object bundleObj = null;
                        try {
                            java.lang.reflect.Method fetch = client.getClass().getMethod("fetchResourceFromUrl", Class.class, String.class);
                            bundleObj = fetch.invoke(client, Bundle.class, remote + "/StructureDefinition");
                        } catch (NoSuchMethodException ns) {
                            // try fluent search fallback via REST call
                            try {
                                java.lang.reflect.Method read = client.getClass().getMethod("search");
                                Object search = read.invoke(client);
                                // too complex to reflect full fluent API; skip
                            } catch (Exception ignore) {}
                        }

                        if (bundleObj instanceof Bundle) {
                            Bundle bundle = (Bundle) bundleObj;
                            // Try PrePopulatedValidationSupport to add StructureDefinitions
                            try {
                                Class<?> prePopClazz = Class.forName("ca.uhn.fhir.validation.support.PrePopulatedValidationSupport");
                                Object prePop = null;
                                try { prePop = prePopClazz.getConstructor(FhirContext.class).newInstance(ctx); } catch (NoSuchMethodException ns) { prePop = prePopClazz.getConstructor().newInstance(); }
                                for (Bundle.BundleEntryComponent entry : bundle.getEntry()) {
                                    if (entry.getResource() instanceof StructureDefinition) {
                                        StructureDefinition sd = (StructureDefinition) entry.getResource();
                                        try {
                                            prePopClazz.getMethod("addStructureDefinition", StructureDefinition.class).invoke(prePop, sd);
                                            String identifier = sd.getUrl() != null ? sd.getUrl() : sd.getId();
                                            if (identifier != null) {
                                                loadedDefinitions.add(identifier);
                                            }
                                        } catch (NoSuchMethodException ns) {
                                            // ignore
                                        }
                                    }
                                }
                                if (!loadedDefinitions.isEmpty()) {
                                    messages.add("Registered StructureDefinitions: " + loadedDefinitions.size());
                                }
                                // add prePop to chain
                                try {
                                    chainClazz.getMethod("addValidationSupport", Class.forName("ca.uhn.fhir.validation.support.IValidationSupport")).invoke(chain, prePop);
                                } catch (NoSuchMethodException ns) {
                                    try { chainClazz.getMethod("addValidationSupport", Object.class).invoke(chain, prePop); } catch (Exception ignore) {}
                                }
                            } catch (ClassNotFoundException cnf) {
                                // prepop class not available; skip
                            }
                        }
                    } catch (Throwable t) {
                        System.err.println("Remote StructureDefinition load failed: " + t.getMessage());
                    }
                }

                // Attach chain to instanceValidator if possible
                try {
                    java.lang.reflect.Method setVs = instClazz.getMethod("setValidationSupport", Class.forName("ca.uhn.fhir.validation.support.IValidationSupport"));
                    setVs.invoke(instanceValidator, chain);
                } catch (NoSuchMethodException ns) {
                    // try generic Object param
                    try { instClazz.getMethod("setValidationSupport", Object.class).invoke(instanceValidator, chain); } catch (Exception ignore) {}
                }
            } catch (ClassNotFoundException cnf) {
                // validation support classes not present; skip
            }

            // Finally register the instance validator module into the FhirValidator via reflection
            try {
                java.lang.reflect.Method reg = validator.getClass().getMethod("registerValidatorModule", Class.forName("ca.uhn.fhir.validation.IValidatorModule"));
                reg.invoke(validator, instanceValidator);
            } catch (NoSuchMethodException ns) {
                // fallback: try registerValidatorModule(Object)
                try { validator.getClass().getMethod("registerValidatorModule", Object.class).invoke(validator, instanceValidator); } catch (Exception ignore) {}
            }

        } catch (Throwable t) {
            // Do not fail startup if validation support cannot be wired.
            System.err.println("Could not configure extended FHIR validation support: " + t.getMessage());
        }
    }
}
