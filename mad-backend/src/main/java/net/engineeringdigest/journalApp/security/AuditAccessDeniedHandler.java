package net.engineeringdigest.journalApp.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 🔒 Component 3 Extension: 403 Audit Interception
 * Captures authorized but Forbidden requests (403 Access Denied),
 * logs the authenticated user identity and path to AuditLogService.
 */
@Slf4j
@Component
public class AuditAccessDeniedHandler implements AccessDeniedHandler {

    @Autowired
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null) ? auth.getName() : "ANONYMOUS";
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String ip = getClientIp(request);

        // 🚨 Log the 403 event (Authenticated but lacked authority)
        auditLogService.saveAuditLog(username, method, uri, 403, 0, ip);

        log.warn("[ACCESS-DENIED] 403 Forbidden for user: {} on {} {} from IP: {}", username, method, uri, ip);

        // Standardized JSON Response
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("error", "Forbidden");
        errorDetails.put("message", "Insufficient privileges to access this resource.");
        errorDetails.put("status", 403);
        errorDetails.put("path", uri);

        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
