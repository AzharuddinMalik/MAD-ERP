package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;

public class DiagnosticTest {

    private String user = "root";
    private String password = "root";

    @Test
    public void runDiagnostics() {
        String getCitiesUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String cmsUrl = "jdbc:mysql://localhost:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection madConn = DriverManager.getConnection(getCitiesUrl, user, password);
             Connection cmsConn = DriverManager.getConnection(cmsUrl, user, password);
             PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\diagnostic_output.txt")) {
            
            out.println("--- CMS PROJECTS ---");
            try (Statement stmt = cmsConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, project_name, city FROM projects")) {
                while (rs.next()) {
                    out.println("Project " + rs.getLong("id") + ": " + rs.getString("project_name") + " (City: " + rs.getString("city") + ")");
                }
            }

            out.println("--- CMS USERS ---");
            try (Statement stmt = cmsConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM users")) {
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                while (rs.next()) {
                    for (int i = 1; i <= columnCount; i++) {
                        out.print(metaData.getColumnName(i) + "=" + rs.getString(i) + ", ");
                    }
                    out.println();
                }
            }
            
            out.println("--- MADCMS ROLES ---");
            try (Statement stmt = madConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM roles")) {
                while (rs.next()) {
                    out.println("Role " + rs.getLong("id") + ": " + rs.getString("name"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
