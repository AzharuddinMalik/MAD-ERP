package net.engineeringdigest.journalApp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.model.*;
import net.engineeringdigest.journalApp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 🚜 Service: Fail-safe Data Migration
 * Migrates data from legacy 'cms' to 'madcms' with duplication checks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectMigrationService {

    private final ProjectRepository projectRepository;
    private final CityRepository cityRepository;
    private final SiteUpdateRepository siteUpdateRepository;

    private final String JDBC_URL_CMS = "jdbc:mysql://localhost:3306/cms?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private final String DB_USER = "root";
    private final String DB_PASS = "root";

    /**
     * ✅ Main Entry Point: Safe Migration
     */
    @Transactional
    public String migrateProjects() {
        int projectsMigrated = 0;
        int updatesMigrated = 0;
        int skipped = 0;

        try (Connection conn = DriverManager.getConnection(JDBC_URL_CMS, DB_USER, DB_PASS)) {
            
            // 1. Fetch Projects from legacy CMS
            String query = "SELECT * FROM projects";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                
                while (rs.next()) {
                    String name = rs.getString("project_name");
                    String cityName = rs.getString("city");
                    String statusStr = rs.getString("status");
                    int labourCount = rs.getInt("labour_count");

                    // 🛡️ FAIL-SAFE: Duplication Check
                    // Check if project with same name and city exists in MADCMS
                    if (isDuplicate(name, cityName)) {
                        log.info("Skipping duplicate project: {} in {}", name, cityName);
                        skipped++;
                        continue;
                    }

                    // 🟢 Resolve City Entity
                    City city = getOrCreateCity(cityName);

                    // 🟢 Create New Project
                    Project project = new Project();
                    project.setName(name);
                    project.setClientName("Legacy Migration"); // Placeholder
                    project.setCity(city);
                    project.setLabourCount(labourCount);
                    project.setStatus(mapStatus(statusStr));
                    
                    Project savedProject = projectRepository.save(project);
                    projectsMigrated++;

                    // 🟠 Migrate Site Updates for this project
                    updatesMigrated += migrateSiteUpdates(conn, rs.getInt("id"), savedProject);
                }
            }

        } catch (SQLException e) {
            log.error("Migration failed: {}", e.getMessage());
            return "Error: " + e.getMessage();
        }

        return String.format("Migration Success! Projects: %d, Updates: %d, Skipped: %d", 
                projectsMigrated, updatesMigrated, skipped);
    }

    private boolean isDuplicate(String name, String cityName) {
        return projectRepository.findAll().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name) && 
                          p.getCity() != null && 
                          p.getCity().getName().equalsIgnoreCase(cityName));
    }

    private City getOrCreateCity(String name) {
        if (name == null || name.isEmpty()) name = "Unknown";
        final String finalName = name.trim();
        
        return cityRepository.findByName(finalName)
                .orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName(finalName);
                    newCity.setState("Unknown");
                    newCity.setActive(true);
                    return cityRepository.save(newCity);
                });
    }

    private ProjectStatus mapStatus(String statusStr) {
        if (statusStr == null) return ProjectStatus.RUNNING;
        try {
            return ProjectStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProjectStatus.RUNNING;
        }
    }

    private int migrateSiteUpdates(Connection conn, int legacyProjectId, Project newProject) throws SQLException {
        int count = 0;
        String query = "SELECT * FROM site_updates WHERE project_id = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setInt(1, legacyProjectId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    SiteUpdate update = new SiteUpdate();
                    update.setProject(newProject);
                    update.setContent(rs.getString("content"));
                    update.setPhotoUrl1(rs.getString("photo_url_1"));
                    update.setPhotoUrl2(rs.getString("photo_url_2"));
                    update.setUpdateTime(rs.getTimestamp("update_time").toLocalDateTime());
                    
                    siteUpdateRepository.save(update);
                    count++;
                }
            }
        }
        return count;
    }
}
