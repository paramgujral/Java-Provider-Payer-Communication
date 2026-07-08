@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        log.debug("Request: {} {}", request.getMethod(), request.getRequestURI());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("No Bearer token found for: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);
            final String email = jwtUtil.extractUsername(token);
            final String role = jwtUtil.extractClaim(token, "role");
            final String fhirId = jwtUtil.extractClaim(token, "fhirResourceId");

            log.info("Token email: {} | Role: {} | FHIR ID: {}", email, role, fhirId);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtUtil.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("Auth set for: {} | Roles: {} | FHIR ID: {}", 
                             userDetails.getUsername(), userDetails.getAuthorities(), fhirId);
                } else {
                    log.warn("Token invalid for user: {}", email);
                }
            }
        } catch (Exception e) {
            log.error("JWT Filter Error: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
}
