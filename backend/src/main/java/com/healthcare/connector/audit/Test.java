package com.healthcare.connector.audit;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Test {

	public static void main(String[] args) {

	    BCryptPasswordEncoder encoder =
	            new BCryptPasswordEncoder();

	    String hash = encoder.encode("admin123");
	    String hash1 =
                "$2a$10$bXzKBBlBDeEvKHpoOoldMOXmJQlJFk/jOjkd7vD20mBXl77Zw4wW";

        System.out.println(
                encoder.matches("admin123", hash1)
        );
//        System.out.println();
//	    System.out.println(hash);
//	    System.out.println(hash.length());
	}
}
