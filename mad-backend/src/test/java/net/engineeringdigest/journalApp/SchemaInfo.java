package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;
import java.io.PrintWriter;

public class SchemaInfo {

    private String user = "root";
    private String password = "root";

    @Test
    public void getInfo() {
        String madUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String cmsUrl = "jdbc:mysql://localhost:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (PrintWriter out = new PrintWriter("D:\\Spring-Boot Vipul Tyagi\\journalApp\\mad-backend\\schema_details.txt")) {
            
            try (Connection conn = DriverManager.getConnection(cmsUrl, user, password)) {
                out.println("=== CMS SITE_UPDATES COLUMNS ===");
                ResultSet rs = conn.getMetaData().getColumns("cms", null, "site_updates", null);
                while (rs.next()) {
                    out.println(rs.getString("COLUMN_NAME"));
                }
            } catch (Exception e) {}

            try (Connection conn = DriverManager.getConnection(madUrl, user, password)) {
                out.println("\n=== MADCMS AUDIT_LOGS COLUMNS ===");
                ResultSet rs = conn.getMetaData().getColumns("madcms", null, "audit_logs", null);
                while (rs.next()) {
                    out.println(rs.getString("COLUMN_NAME"));
                }
            } catch (Exception e) {}

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
