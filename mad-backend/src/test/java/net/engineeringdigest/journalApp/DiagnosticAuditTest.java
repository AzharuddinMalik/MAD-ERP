package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;

public class DiagnosticAuditTest {

    private String user = "root";
    private String password = "root";

    @Test
    public void runAudit() {
        System.out.println("DEBUG: ROW COUNT COMPARISON");

        countRows("cms", "projects");
        countRows("madcms", "projects");
        countRows("madcms", "attendance");
        countRows("madcms", "labour");

        System.out.println("DEBUG: COMPARISON COMPLETE");
    }

    private void countRows(String schema, String table) {
        String url = "jdbc:mysql://localhost:3306/" + schema + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + table)) {
            
            if (rs.next()) {
                System.out.println(schema + "." + table + " : " + rs.getInt(1) + " rows");
            }
        } catch (SQLException e) {
            System.err.println("Failed to count " + schema + "." + table + ": " + e.getMessage());
        }
    }
}
