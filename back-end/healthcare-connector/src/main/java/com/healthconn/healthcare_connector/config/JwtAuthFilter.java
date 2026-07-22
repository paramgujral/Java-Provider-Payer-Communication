package com.healthconn.healthcare_connector.config;

import com.healthconn.healthcare_connector.authentication.service.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/fhir/login")
                || path.equals("/fhir/$login")
                || path.equals("/fhir/Practitioner")
                || path.equals("/fhir/metadata")
                || path.startsWith("/api/auth/")
                || path.startsWith("/ws/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api-docs")
                || path.startsWith("/h2-console");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        log.debug("Processing request: {} {}", request.getMethod(), request.getRequestURI());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);
            final String email = jwtUtil.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtUtil.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    log.warn("Token validation failed for {}", email);
                }
            }
        } catch (ExpiredJwtException ex) {
            log.warn("JWT expired for request {}. Please login again.", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/fhir+json");
            response.getWriter().write(
                    "{\"resourceType\":\"OperationOutcome\",\"issue\":[{"
                            + "\"severity\":\"error\",\"code\":\"login\","
                            + "\"diagnostics\":\"JWT expired. Please login again.\"}]}");
            return;
        } catch (Exception e) {
            log.warn("JWT filter error for {}: {}", request.getRequestURI(), e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/fhir+json");
            response.getWriter().write(
                    "{\"resourceType\":\"OperationOutcome\",\"issue\":[{"
                            + "\"severity\":\"error\",\"code\":\"security\","
                            + "\"diagnostics\":\"Invalid JWT token.\"}]}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
