@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    
    @PostMapping("/providers/onboarding")
    public ResponseEntity<AuthResponse> providerOnboarding(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.onboardProvider(request));
    }

    
    @PostMapping("/payers/onboarding")
    public ResponseEntity<AuthResponse> payerOnboarding(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.onboardPayer(request));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Healthcare Connector API running with AI Copilot");
    }
}
