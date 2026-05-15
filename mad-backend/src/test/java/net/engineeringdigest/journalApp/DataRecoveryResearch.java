package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;
import java.util.*;

public class DataRecoveryResearch {

    private String user = "root";
    private String password = "root";

    @Test
    public void runResearch() {
        String madUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String cmsUrl = "jdbc:mysql://localhost:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection madConn = DriverManager.getConnection(madUrl, user, password);
             Connection cmsConn = DriverManager.getConnection(cmsUrl, user, password);
             PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\recovery_research.txt")) {
            
            out.println("=== SCHEMAS ON SERVER ===");
            try (ResultSet rs = cmsConn.getMetaData().getCatalogs()) {
                while (rs.next()) {
                    out.println("Schema: " + rs.getString(1));
                }
            }

            out.println("\n=== CMS TABLES ===");
            try (ResultSet rs = cmsConn.getMetaData().getTables("cms", null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    out.println("Table in CMS: " + rs.getString("TABLE_NAME"));
                }
            }

            out.println("\n=== CMS CITIES RESEARCH ===");
            try (Statement stmt = cmsConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT DISTINCT city FROM projects WHERE city IS NOT NULL")) {
                while (rs.next()) {
                    out.println("City found in CMS: [" + rs.getString("city") + "]");
                }
            }

            out.println("\n=== SEARCHING FOR USERS TABLE ACROSS ALL SCHEMAS ===");
            List<String> schemas = Arrays.asList("cms", "madcms", "journaldb", "test"); // Common names
            for (String schema : schemas) {
                try {
                    String url = "jdbc:mysql://localhost:3306/" + schema + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
                    Connection conn = DriverManager.getConnection(url, user, password);
                    ResultSet rs = conn.getMetaData().getTables(schema, null, "%user%", new String[]{"TABLE"});
                    while (rs.next()) {
                        String tableName = rs.getString("TABLE_NAME");
                        out.println("Potentially relevant table in [" + schema + "]: " + tableName);
                        // Check row count
                        Statement countStmt = conn.createStatement();
                        ResultSet countRs = countStmt.executeQuery("SELECT COUNT(*) FROM " + tableName);
                        if (countRs.next()) {
                            out.println("  -> Row count: " + countRs.getInt(1));
                        }
                    }
                    conn.close();
                } catch (Exception e) {}
            }

            out.println("\n=== MADCMS ROLES RESEARCH ===");
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
