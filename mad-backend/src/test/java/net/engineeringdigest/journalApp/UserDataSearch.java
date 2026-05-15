package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;

public class UserDataSearch {

    private String user = "root";
    private String password = "root";

    @Test
    public void searchForUsers() {
        String madUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String cmsUrl = "jdbc:mysql://localhost:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection madConn = DriverManager.getConnection(madUrl, user, password);
             Connection cmsConn = DriverManager.getConnection(cmsUrl, user, password);
             PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\user_search_results.txt")) {
            
            out.println("=== CMS SITE UPDATES (HINTS) ===");
            try (Statement stmt = cmsConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT DISTINCT supervisor_name FROM site_updates WHERE supervisor_name IS NOT NULL")) {
                while (rs.next()) {
                    out.println("Supervisor name found in site_updates: " + rs.getString(1));
                }
            } catch (Exception e) { out.println("Error reading site_updates: " + e.getMessage()); }

            out.println("\n=== MADCMS AUDIT LOGS (HINTS) ===");
            try (Statement stmt = madConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT DISTINCT actor FROM audit_logs")) {
                while (rs.next()) {
                    out.println("Actor found in audit logs: " + rs.getString(1));
                }
            } catch (Exception e) { out.println("Error reading audit_logs: " + e.getMessage()); }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
