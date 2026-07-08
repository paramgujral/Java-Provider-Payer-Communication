@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(req.role())
                .fhirResourceId(req.fhirResourceId())
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user, user.getRole().name(), user.getId(), user.getFhirResourceId());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name(), user.getFhirResourceId());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user, user.getRole().name(), user.getId(), user.getFhirResourceId());
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole().name(), user.getFhirResourceId());
    }

    public AuthResponse onboardProvider(RegisterRequest req) {
        RegisterRequest providerReq = new RegisterRequest(req.email(), req.password(), req.fullName(), Role.PROVIDER, req.fhirResourceId());
        return register(providerReq);
    }

    public AuthResponse onboardPayer(RegisterRequest req) {
        RegisterRequest payerReq = new RegisterRequest(req.email(), req.password(), req.fullName(), Role.PAYER, req.fhirResourceId());
        return register(payerReq);
    }
}
