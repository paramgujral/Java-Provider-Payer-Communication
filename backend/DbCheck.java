import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
public class DbCheck {
  public static void main(String[] args) throws Exception {
    Class.forName("org.postgresql.Driver");
    String url = "jdbc:postgresql://localhost:5432/healthcare_db";
    try (Connection conn = DriverManager.getConnection(url, "postgres", "root")) {
      PreparedStatement ps = conn.prepareStatement("select id,email,role,enabled,password from users where email = ?");
      ps.setString(1, "provider.submit.9e7a15dd@example.com");
      try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
          System.out.println("id=" + rs.getLong(1));
          System.out.println("email=" + rs.getString(2));
          System.out.println("role=" + rs.getString(3));
          System.out.println("enabled=" + rs.getBoolean(4));
          System.out.println("password=" + rs.getString(5));
        } else {
          System.out.println("no-user");
        }
      }
    }
  }
}
