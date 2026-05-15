package net.engineeringdigest.journalApp;

import org.junit.jupiter.api.Test;
import java.sql.*;

public class MigrateDataTest {

    private String user = "root";
    private String password = "root";

    @Test
    public void migrateProjects() {
        System.out.println("DEBUG: MIGRATING PROJECTS FROM CMS TO MADCMS");

        String getCitiesUrl = "jdbc:mysql://localhost:3306/madcms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String cmsUrl = "jdbc:mysql://localhost:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        
        try (Connection madConn = DriverManager.getConnection(getCitiesUrl, user, password);
             Connection cmsConn = DriverManager.getConnection(cmsUrl, user, password)) {
            
            // Get default city ID
            long defaultCityId = 1L;
            try (Statement stmt = madConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id FROM cities LIMIT 1")) {
                if (rs.next()) {
                    defaultCityId = rs.getLong(1);
                }
            }

            // Select from CMS
            try (Statement stmt = cmsConn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, project_name, city, status, labour_count FROM projects")) {
                
                String insertSql = "INSERT INTO projects (id, client_name, created_at, labour_count, location, name, start_date, status, city_id, supervisor_id) " +
                                   "VALUES (?, ?, NOW(), ?, ?, ?, NOW(), ?, ?, NULL) " +
                                   "ON DUPLICATE KEY UPDATE name=VALUES(name)";
                try (PreparedStatement pstmt = madConn.prepareStatement(insertSql)) {
                    int count = 0;
                    while (rs.next()) {
                        long id = rs.getLong("id");
                        String name = rs.getString("project_name");
                        String city = rs.getString("city");
                        String status = rs.getString("status");
                        int labourCount = rs.getInt("labour_count");
                        
                        pstmt.setLong(1, id);
                        pstmt.setString(2, "Legacy Client");
                        pstmt.setInt(3, labourCount);
                        pstmt.setString(4, city != null ? city : "Unknown Location");
                        pstmt.setString(5, name != null ? name : "Unknown Project");
                        pstmt.setString(6, status != null ? status : "RUNNING");
                        pstmt.setLong(7, defaultCityId);
                        pstmt.executeUpdate();
                        count++;
                    }
                    System.out.println("Successfully migrated " + count + " projects.");
                }
            }

        } catch (SQLException e) {
            System.err.println("Migration Failed: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("DEBUG: MIGRATION COMPLETE");
    }
}
