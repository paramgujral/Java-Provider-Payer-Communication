package com.feuji.healthcare.auth.repository;

import com.feuji.healthcare.auth.entity.RoleEntity;
import com.feuji.healthcare.common.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository
        extends JpaRepository<RoleEntity, Long> {

    Optional<RoleEntity> findByRoleName(RoleType roleType);
}
