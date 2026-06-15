package com.example.demo.health_care.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IdExistsValidator.class)
public @interface IdExists {

    String message() default "Entity not found for id";

    Class<?> repository();

    String idField() default "id";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

