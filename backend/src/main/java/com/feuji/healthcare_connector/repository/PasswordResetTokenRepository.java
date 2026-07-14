package com.feuji.healthcare_connector.repository;

import com.feuji.healthcare_connector.entity.PasswordResetToken;
import com.feuji.healthcare_connector.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findFirstByUserAndUsedFalseOrderByCreatedAtDesc(User user);
}
