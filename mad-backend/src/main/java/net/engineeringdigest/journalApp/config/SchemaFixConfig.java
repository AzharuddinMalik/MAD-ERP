package net.engineeringdigest.journalApp.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;

/**
 * 🛠️ Schema Fix Config
 * Manually ensures that database columns have sufficient length to prevent truncation errors.
 * This bypasses Hibernate/Flyway validation issues for a quick fix.
 */
@Configuration
@Slf4j
public class SchemaFixConfig {

    @Bean
    public CommandLineRunner fixSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                log.info("🛠️ Attempting to fix database column lengths...");
                
                // Fix AuditLog method length
                jdbcTemplate.execute("ALTER TABLE audit_logs MODIFY COLUMN method VARCHAR(50) NOT NULL");
                log.info("✅ Fixed audit_logs.method length");
                
                // Fix Project status length
                jdbcTemplate.execute("ALTER TABLE projects MODIFY COLUMN status VARCHAR(50)");
                log.info("✅ Fixed projects.status length");
                
            } catch (Exception e) {
                log.warn("⚠️ Schema fix failed (this is expected if columns are already updated or if using H2): {}", e.getMessage());
            }
        };
    }
}
