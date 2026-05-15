package net.engineeringdigest.journalApp.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.engineeringdigest.journalApp.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.AuthenticationException;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 🧪 Phase 2 Test: AuditAuthenticationEntryPoint (Unit)
 * Verifies that 401 Unauthorized requests are:
 * 1. Logged via AuditLogService with ANONYMOUS username
 * 2. Responded with standardized JSON containing status 401
 * 3. Client IP is captured correctly
 */
@ExtendWith(MockitoExtension.class)
class AuditAuthenticationEntryPointTest {

    @Mock AuditLogService auditLogService;
    @Mock HttpServletRequest request;
    @Mock HttpServletResponse response;
    @InjectMocks AuditAuthenticationEntryPoint entryPoint;

    @Test
    void B2_4_unauthenticatedRequest_logsAnonymousAndReturnsJson401() throws Exception {
        // Arrange
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);

        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/v1/projects");
        when(request.getRemoteAddr()).thenReturn("192.168.1.100");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(response.getWriter()).thenReturn(printWriter);

        AuthenticationException authEx = new org.springframework.security.authentication.BadCredentialsException("Bad credentials");

        // Act
        entryPoint.commence(request, response, authEx);

        // Assert — Audit log was called with ANONYMOUS + correct IP
        verify(auditLogService).saveAuditLog(
            eq("ANONYMOUS"), eq("GET"), eq("/api/v1/projects"),
            eq(401), eq(0L), eq("192.168.1.100"));

        // Assert — Response headers set
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");

        // Assert — Response body is valid JSON with expected fields
        String jsonResponse = stringWriter.toString();
        assertThat(jsonResponse).contains("\"error\"");
        assertThat(jsonResponse).contains("\"Unauthorized\"");
        assertThat(jsonResponse).contains("\"status\"");
        assertThat(jsonResponse).contains("401");
        // Zero leakage: no stack trace or internal details
        assertThat(jsonResponse).doesNotContain("stackTrace");
        assertThat(jsonResponse).doesNotContain("BadCredentialsException");
    }
}
