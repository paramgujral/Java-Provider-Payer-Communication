package com.healthcare.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    @Test
    void shouldGenerateAndValidateToken() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "ThisIsASecretKeyForHealthcareJwtSecurityThisIsASecretKeyForHealthcareJwtSecurity");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);

        String token = jwtUtil.generateToken("nilesh", "ROLE_PROVIDER");

        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("nilesh", jwtUtil.extractUsername(token));
        assertEquals("ROLE_PROVIDER", jwtUtil.extractRole(token));
    }
}
