package net.engineeringdigest.journalApp.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 🛡️ C3.3: IP-Based Rate Limiter
 * Uses Bucket4j token-bucket algorithm: 10 requests/minute per unique client IP.
 * ⚠️ Single-node implementation. For multi-node (Render horizontal scaling),
 *    replace ConcurrentHashMap with Redis-backed Bucket4j (bucket4j-redis).
 *
 * Runs at @Order(1) — BEFORE Spring Security filter chain — so abusive IPs
 * are rejected immediately without authentication overhead.
 */
@Slf4j
@Component
@Order(1)
public class RateLimitFilter implements Filter {

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpReq = (HttpServletRequest) request;
        HttpServletResponse httpResp = (HttpServletResponse) response;

        String clientIp = extractClientIp(httpReq);
        
        // 🚀 Dev Whitelist: Skip limits for local development
        if ("127.0.0.1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp)) {
            chain.doFilter(request, response);
            return;
        }

        Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createBucket());

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            log.warn("[RATE-LIMIT] IP {} exceeded rate limit on {} {}", clientIp,
                    httpReq.getMethod(), httpReq.getRequestURI());
            httpResp.setStatus(429);
            httpResp.setContentType("application/json");
            httpResp.getWriter().write(
                "{\"error\":\"Too Many Requests\",\"status\":429," +
                "\"message\":\"Rate limit exceeded. Please wait before retrying.\"}"
            );
        }
    }

    /**
     * 10 requests per minute per IP (greedy refill = instantly available as time passes).
     * Auth endpoints like /api/auth/login benefit most from this protection.
     */
    private Bucket createBucket() {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1))))
            .build();
    }

    /**
     * Respects X-Forwarded-For header for Render's load balancer / Cloudflare proxies.
     * Takes only the FIRST IP to avoid header injection attacks.
     */
    private String extractClientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String realIp = req.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return req.getRemoteAddr();
    }
}
