package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;

public class AuditUserSearch {

    private String user = "root";
    private String password = "root";

    @Test
    public void searchUsernames() {
        String madUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection conn = DriverManager.getConnection(madUrl, user, password);
             PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\audit_usernames.txt")) {
            
            out.println("=== UNIQUE USERNAMES IN AUDIT LOGS ===");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT DISTINCT username FROM audit_logs WHERE username IS NOT NULL AND username != 'anonymousUser'")) {
                while (rs.next()) {
                    out.println(rs.getString(1));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
