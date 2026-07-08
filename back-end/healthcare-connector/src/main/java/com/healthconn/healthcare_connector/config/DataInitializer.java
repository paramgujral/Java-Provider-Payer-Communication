@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Admin")
                    .role(Role.ADMIN)
                    .fhirResourceId("FHIR-ADMIN-001") 
                    .enabled(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Default admin user created: admin@gmail.com with FHIR ID FHIR-ADMIN-001");
        }
    }
}
