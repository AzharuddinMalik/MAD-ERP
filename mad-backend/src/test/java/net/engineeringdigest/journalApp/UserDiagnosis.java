package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;

public class UserDiagnosis {

    private String user = "root";
    private String password = "root";

    @Test
    public void diagnoseUsers() {
        String madUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection madConn = DriverManager.getConnection(madUrl, user, password);
             PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\user_diagnosis.txt")) {
            
            out.println("=== MADCMS USERS ===");
            try (Statement stmt = madConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT u.id, u.username, u.full_name, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id")) {
                while (rs.next()) {
                    out.println("User: ID=" + rs.getLong("id") + ", Username=[" + rs.getString("username") + "], FullName=[" + rs.getString("full_name") + "], Role=[" + rs.getString("role_name") + "]");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
