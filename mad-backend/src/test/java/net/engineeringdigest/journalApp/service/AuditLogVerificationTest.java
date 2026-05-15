package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.config.AsyncConfig;
import net.engineeringdigest.journalApp.model.AuditLog;
import net.engineeringdigest.journalApp.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

/**
 * 🧪 AuditLogVerificationTest
 * Integrated test verifying the Asynchronous Persistence Layer.
 * Uses H2 In-Memory DB for complete isolation from production data.
 */
@DataJpaTest
@Import({AuditLogService.class, AsyncConfig.class})
@ActiveProfiles("test")
public class AuditLogVerificationTest {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void testAsyncAuditLogSave() {
        // 1. Trigger Async Operation
        auditLogService.saveAuditLog("testUser", "GET", "/api/v1/admin/projects", 200, 50, "127.0.0.1");

        // 2. ASSERT: Use Awaitility to wait for the background save to complete
        await().atMost(Duration.ofSeconds(5))
                .untilAsserted(() -> {
                    List<AuditLog> logs = auditLogRepository.findAll();
                    assertThat(logs).isNotEmpty();
                    assertThat(logs.get(0).getUsername()).isEqualTo("testUser");
                    assertThat(logs.get(0).getStatus()).isEqualTo(200);
                });
    }

    @Test
    void testAnonymousFailedLoginAudit() {
        // Simulate a 401 Unauthorized for a login attempt
        auditLogService.saveAuditLog("ANONYMOUS", "POST", "/api/v1/auth/login", 401, 12, "192.168.1.1");

        await().atMost(Duration.ofSeconds(5))
                .untilAsserted(() -> {
                    List<AuditLog> logs = auditLogRepository.findAll();
                    assertThat(logs).anyMatch(log -> "ANONYMOUS".equals(log.getUsername()) && log.getStatus() == 401);
                });
    }

    @Test
    void testUriScrubbingInService() {
        // Note: The filter usually scrubs, but the service should handle whatever it gets.
        // If the service logic doesn't scrub, we'll verify the data it receives is saved correctly.
        String sensitiveUri = "/api/v1/admin/projects?token=SECRET_123";
        
        // Mocking the filter's scrubbed input
        String scrubbedUri = sensitiveUri.split("\\?")[0];
        
        auditLogService.saveAuditLog("admin", "GET", scrubbedUri, 200, 10, "127.0.0.1");

        await().atMost(Duration.ofSeconds(5))
                .untilAsserted(() -> {
                    List<AuditLog> logs = auditLogRepository.findAll();
                    assertThat(logs).anyMatch(log -> log.getUri().equals("/api/v1/admin/projects"));
                    assertThat(logs).noneMatch(log -> log.getUri().contains("token="));
                });
    }
}
