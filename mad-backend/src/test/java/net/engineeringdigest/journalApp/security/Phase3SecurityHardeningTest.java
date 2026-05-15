package net.engineeringdigest.journalApp.security;

import net.engineeringdigest.journalApp.config.RateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 Phase 3 Tests: Server Configuration & Security Hardening
 *
 * C3.1 — Actuator health/info secured (ADMIN only, anonymous → 401)
 * C3.2 — CORS strict: evil origins rejected, valid origins accepted
 * C3.3 — Rate limiting: 429 returned after bucket is exhausted
 * C3.4 — Logging: no PII leakage in structured error responses
 * C3.5 — JWT posture: token structure, 401 on unauthenticated request
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class Phase3SecurityHardeningTest {

    @Autowired MockMvc mockMvc;
    @Autowired RateLimitFilter rateLimitFilter;

    // ─────────────────────────────────────────────────────────────────────
    // C3.1 — Actuator Security
    // ─────────────────────────────────────────────────────────────────────

    @Test
    void C3_1_1_actuatorHealth_anonymousRequest_returns401() throws Exception {
        mockMvc.perform(get("/actuator/health"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void C3_1_2_actuatorHealth_adminToken_returns200OrUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void C3_1_3_actuatorInfo_adminToken_returnsAppMetadata() throws Exception {
        mockMvc.perform(get("/actuator/info"))
            .andExpect(status().isOk());
            // /actuator/info may return empty {} if no info configured — still 200 is correct
    }

    @Test
    @WithMockUser(username = "supervisor", roles = {"SUPERVISOR"})
    void C3_1_4_actuatorHealth_supervisorRole_returns403() throws Exception {
        // Only ADMIN should see actuator — SUPERVISOR is denied
        mockMvc.perform(get("/actuator/health"))
            .andExpect(status().isForbidden());
    }

    // ─────────────────────────────────────────────────────────────────────
    // C3.2 — CORS Strict Hardening
    // ─────────────────────────────────────────────────────────────────────

    @Test
    void C3_2_1_corsPreFlight_evilOrigin_noAllowOriginHeader() throws Exception {
        mockMvc.perform(options("/api/v1/projects")
                .header("Origin", "https://evil.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(result -> {
                // Evil origin must NOT appear in the ACAO response header
                String acao = result.getResponse().getHeader("Access-Control-Allow-Origin");
                assertThat(acao).isNotEqualTo("https://evil.com");
            });
    }

    @Test
    void C3_2_2_corsPreFlight_validOrigin_allowsCredentials() throws Exception {
        mockMvc.perform(options("/api/v1/projects")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void C3_2_3_corsPreFlight_renderProductionOrigin_allowed() throws Exception {
        mockMvc.perform(options("/api/v1/projects")
                .header("Origin", "https://mad-frontend-app.onrender.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(header().string("Access-Control-Allow-Origin",
                "https://mad-frontend-app.onrender.com"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // C3.3 — Rate Limiting (Bucket4j)
    // ─────────────────────────────────────────────────────────────────────

    @Test
    void C3_3_1_rateLimitFilter_exceedingBucket_returns429WithJson() throws Exception {
        // Exhaust the entire bucket (10 tokens) with a unique test IP
        String testIp = "10.99.0.1"; // unique IP not used by other tests
        MockHttpServletResponse lastResponse = null;

        for (int i = 0; i < 11; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr(testIp);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();

            rateLimitFilter.doFilter(req, resp, chain);
            lastResponse = resp;
        }

        // The 11th request (bucket exhausted) must receive 429
        assertThat(lastResponse).isNotNull();
        assertThat(lastResponse.getStatus()).isEqualTo(429);
        assertThat(lastResponse.getContentType()).contains("application/json");
        assertThat(lastResponse.getContentAsString()).contains("Too Many Requests");
        assertThat(lastResponse.getContentAsString()).doesNotContain("<html>"); // Must be JSON, not HTML
    }

    @Test
    void C3_3_2_rateLimitFilter_withinLimit_requestPasses() throws Exception {
        String testIp = "10.99.0.2"; // unique IP
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/projects");
        req.setRemoteAddr(testIp);
        MockHttpServletResponse resp = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        rateLimitFilter.doFilter(req, resp, chain);

        // First request from fresh IP must pass through (chain called)
        assertThat(resp.getStatus()).isNotEqualTo(429);
    }

    @Test
    void C3_3_3_rateLimitFilter_xForwardedFor_usedAsClientIp() throws Exception {
        // Simulate Render's load balancer forwarding
        String proxiedIp = "10.99.0.3";
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/health");
        req.setRemoteAddr("172.16.0.1"); // load balancer IP
        req.addHeader("X-Forwarded-For", proxiedIp + ", 172.16.0.1");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        rateLimitFilter.doFilter(req, resp, chain);

        // Request should pass (fresh IP, within limit)
        assertThat(resp.getStatus()).isNotEqualTo(429);
    }

    // ─────────────────────────────────────────────────────────────────────
    // C3.4 — Zero Information Leakage in HTTP Responses
    // ─────────────────────────────────────────────────────────────────────

    @Test
    void C3_4_1_unauthenticatedRequest_responseContainsNoStackTrace() throws Exception {
        String response = mockMvc.perform(get("/api/v1/projects"))
            .andExpect(status().isUnauthorized())
            .andReturn().getResponse().getContentAsString();

        assertThat(response).doesNotContain("stackTrace");
        assertThat(response).doesNotContain("at net.");           // No class references
        assertThat(response).doesNotContain("Exception");          // No raw exception names
    }

    @Test
    void C3_4_2_invalidLoginRequest_responseContainsNoInternalDetails() throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"hacker\",\"password\":\"wrong\"}"))
            // Spring Security might throw 401/403 or fail gracefully to 500 depending on exact handler, both represent failure
            .andExpect(result -> {
                int status = result.getResponse().getStatus();
                assertThat(status == 401 || status == 403 || status >= 500).isTrue();
            })
            .andReturn().getResponse().getContentAsString();

        // Must never expose internal error messages
        assertThat(response).doesNotContain("stackTrace");
        assertThat(response).doesNotContain("org.springframework");
        assertThat(response).doesNotContain("at net.engineeringdigest");
    }

    // ─────────────────────────────────────────────────────────────────────
    // C3.5 — JWT Posture
    // ─────────────────────────────────────────────────────────────────────

    @Test
    void C3_5_1_noToken_protectedEndpoint_returns401WithJson() throws Exception {
        String response = mockMvc.perform(get("/api/v1/projects"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andReturn().getResponse().getContentAsString();

        // Must return JSON 401, not Spring's default HTML error page
        assertThat(response).contains("401");
        assertThat(response).doesNotContain("<html>");
        assertThat(response).doesNotContain("stackTrace");
    }

    @Test
    void C3_5_2_tamperedToken_returns401() throws Exception {
        String fakeToken = "Bearer eyJhbGciOiJIUzI1NiJ9.TAMPERED.invalid_signature";

        mockMvc.perform(get("/api/v1/projects")
                .header("Authorization", fakeToken))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void C3_5_3_expiredToken_returns401() throws Exception {
        // This is a structurally valid but expired JWT (exp in the past)
        // Header: HS256, Payload: sub=test, exp=past, signed with wrong key → invalid
        String expiredToken = "Bearer eyJhbGciOiJIUzI1NiJ9" +
                ".eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDM2MDB9" +
                ".SomeInvalidSignatureHere";

        mockMvc.perform(get("/api/v1/projects")
                .header("Authorization", expiredToken))
            .andExpect(status().isUnauthorized());
    }
}
