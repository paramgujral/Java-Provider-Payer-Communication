@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String email = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractClaim(token, "role");
                    String fhirId = jwtUtil.extractClaim(token, "fhirResourceId");

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtUtil.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        accessor.setUser(auth);
                        log.info(" WebSocket authenticated: {} | Role: {} | FHIR ID: {}", email, role, fhirId);
                    } else {
                        log.warn("Invalid WebSocket token for user: {}", email);
                    }
                } catch (Exception e) {
                    log.error(" WebSocket auth failed: {}", e.getMessage(), e);
                }
            }
        }
        return message;
    }
}
