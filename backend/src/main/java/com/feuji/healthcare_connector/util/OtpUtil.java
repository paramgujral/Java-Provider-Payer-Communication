package com.feuji.healthcare_connector.util;

import java.security.SecureRandom;

public class OtpUtil {
    private static final SecureRandom random = new SecureRandom();

    public static String generateOtp() {
        int num = random.nextInt(900000) + 100000; // Generates a number between 100000 and 999999
        return String.valueOf(num);
    }
}
