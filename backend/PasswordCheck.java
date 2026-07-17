import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class PasswordCheck {
  public static void main(String[] args) {
    String raw = "Password@123";
    String hash = "$2a$10$PJ2qK4d7qLsw9CTU4F5dqupdx4.PH1ofp04TJE8IF9fdKFfP.mrju";
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    System.out.println(encoder.matches(raw, hash));
  }
}
