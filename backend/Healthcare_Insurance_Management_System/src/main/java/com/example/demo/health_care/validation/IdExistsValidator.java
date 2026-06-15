package com.example.demo.health_care.validation;

import java.util.Optional;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.ReflectionUtils;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class IdExistsValidator implements ConstraintValidator<IdExists, Object> {

    private Class<?> repositoryClass;

    @Autowired
    private BeanFactory beanFactory;

    @Override
    public void initialize(IdExists constraintAnnotation) {
        this.repositoryClass = constraintAnnotation.repository();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            Object repositoryBean = beanFactory.getBean(repositoryClass);

            var method = ReflectionUtils.findMethod(repositoryBean.getClass(), "findById", value.getClass());
            if (method == null) {
                method = ReflectionUtils.findMethod(repositoryBean.getClass(), "findById", Object.class);
            }
            if (method == null) {
                return false;
            }

            Object result = method.invoke(repositoryBean, value);
            if (!(result instanceof Optional<?> opt)) {
                return false;
            }

            return opt.isPresent();
        } catch (Exception ex) {
            return false;
        }
    }
}


