package net.engineeringdigest.journalApp.security;

import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.engineeringdigest.journalApp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class AuditLoggingFilter extends OncePerRequestFilter {

    @Autowired
    private AuditLogService auditLogService;

    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/api/auth/",
            "/health",
            "/uploads/",
            "/favicon.ico"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            handleAudit(request, response, duration);
        }
    }

    private void handleAudit(HttpServletRequest request, HttpServletResponse response, long duration) {
        try {
            String method = request.getMethod();
            String uri = scrubUri(request.getRequestURI());
            int status = response.getStatus();
            String ip = getClientIp(request);
            
            // Resolve Identity
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ANONYMOUS";

            // Trigger Async DB Save
            auditLogService.saveAuditLog(username, method, uri, status, duration, ip);

            // Maintain SLF4J log for immediate monitoring
            String logMsg = String.format("[AUDIT] %s | %s %s | STATUS: %d | TIME: %dms | IP: %s",
                    username, method, uri, status, duration, ip);
            
            if (status >= 400) {
                log.warn(logMsg);
            } else {
                log.info(logMsg);
            }
        } catch (Exception e) {
            log.error("[AUDIT-FILTER-ERROR] Failed to process audit logic: {}", e.getMessage());
        }
    }

    private String scrubUri(String uri) {
        // Strip common sensitive query patterns if present in URI
        // Note: request.getRequestURI() usually doesn't include query params, 
        // but we handle it just in case of internal forwards or specific controller behaviors.
        if (uri.contains("?")) {
            return uri.split("\\?")[0];
        }
        return uri;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
