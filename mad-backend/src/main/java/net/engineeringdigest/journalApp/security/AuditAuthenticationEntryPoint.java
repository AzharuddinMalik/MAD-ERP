package net.engineeringdigest.journalApp.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 🔒 Component 3: 401 Audit Interception
 * Captures unauthenticated requests (401 Unauthorized) at the filter level,
 * logs them via AuditLogService, and returns a standardized JSON response.
 */
@Slf4j
@Component
public class AuditAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Autowired
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String ip = getClientIp(request);

        // 🚨 Log the 401 attempt as ANONYMOUS
        // Usage of REQUIRES_NEW in AuditLogService ensures this persists in DB.
        auditLogService.saveAuditLog("ANONYMOUS", method, uri, 401, 0, ip);

        log.warn("[AUTH-FAILURE] 401 Unauthorized on {} {} from IP: {}", method, uri, ip);

        // Standardized JSON Response
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("error", "Unauthorized");
        errorDetails.put("message", "Valid JWT authentication required.");
        errorDetails.put("status", 401);
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
