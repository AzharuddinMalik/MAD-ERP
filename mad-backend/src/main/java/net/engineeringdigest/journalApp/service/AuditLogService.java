package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.model.AuditLog;
import net.engineeringdigest.journalApp.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * 🚀 Asynchronously log an operation.
     * Uses REQUIRES_NEW to ensure the audit entry persists even if the caller transaction rolls back.
     */
    @Async("auditLogExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAuditLog(String username, String method, String uri, int status, long duration, String ip) {
        try {
            // Safety truncation to prevent SQL Data Truncation errors
            String safeIp = (ip != null && ip.length() > 45) ? ip.substring(0, 45) : ip;
            String safeUri = (uri != null && uri.length() > 255) ? uri.substring(0, 255) : uri;
            String safeUsername = (username != null && username.length() > 100) ? username.substring(0, 100) : username;

            AuditLog auditLog = new AuditLog(safeUsername, method, safeUri, status, duration, safeIp);
            auditLogRepository.save(auditLog);
            if (status >= 400) {
                log.warn("[DATABASE-AUDIT] Operation Failed: {} {} by {} from {} (Status: {}, {}ms)", 
                        method, safeUri, safeUsername, safeIp, status, duration);
            }
        } catch (Exception e) {
            log.error("[AUDIT-FAILURE] Failed to save audit log: {}", e.getMessage());
            // Fail silently to avoid breaking request flow
        }
    }

    /**
     * 🗑️ Periodic cleanup of old logs (Older than 90 days).
     * Runs every day at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldLogs() {
        try {
            LocalDateTime expiry = LocalDateTime.now().minusDays(90);
            auditLogRepository.deleteByTimestampBefore(expiry);
            log.info("[AUDIT-CLEANUP] Successfully removed audit logs older than {}", expiry);
        } catch (Exception e) {
            log.error("[AUDIT-CLEANUP-FAILURE] Failed to clean old logs: {}", e.getMessage());
        }
    }
}
