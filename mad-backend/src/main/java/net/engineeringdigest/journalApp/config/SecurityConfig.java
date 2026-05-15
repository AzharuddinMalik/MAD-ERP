package net.engineeringdigest.journalApp.config;

import net.engineeringdigest.journalApp.security.AuditLoggingFilter;
import net.engineeringdigest.journalApp.security.CustomUserDetailsService;
import net.engineeringdigest.journalApp.security.JwtAuthenticationFilter;
import net.engineeringdigest.journalApp.security.JwtUtil;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.info.InfoEndpoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * 🔒 Production-Grade Security Configuration
 * Implements Phase 3 hardening:
 * - C3.1: Actuator secured (ADMIN-only health/info, all others denied)
 * - C3.2: Strict CORS — explicit origins only, no wildcards
 * - Unchanged: JWT stateless auth, RBAC on API routes
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthFilter,
                                                   AuditLoggingFilter auditLoggingFilter,
                                                   net.engineeringdigest.journalApp.security.AuditAuthenticationEntryPoint auditEntryPoint,
                                                   net.engineeringdigest.journalApp.security.AuditAccessDeniedHandler auditAccessDeniedHandler)
            throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 🟢 STEP 0: CORS preflight pass-through
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🟢 STEP 1: Public endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/public/**").permitAll()
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/error", "/error/**").permitAll()

                        // 🟢 STEP 1.5: SSE Notifications (Shared)
                        .requestMatchers("/api/v1/notifications", "/api/v1/notifications/**").hasAnyRole("ADMIN", "SUPERVISOR")

                        // 🔒 C3.1: Actuator — health & info visible to ADMIN only
                        .requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class))
                            .hasRole("ADMIN")
                        // 🔒 Deny ALL other actuator endpoints (e.g. /actuator/env, /actuator/beans)
                        .requestMatchers(EndpointRequest.toAnyEndpoint()).denyAll()

                        // 🟢 STEP 2: Shared Reads (Admin & Supervisor)
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/projects", "/api/v1/admin/projects/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/dashboard", "/api/v1/admin/dashboard/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/leads", "/api/v1/admin/leads/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/vendors", "/api/v1/admin/vendors/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/inventory", "/api/v1/admin/inventory/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/cities", "/api/v1/admin/cities/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/supervisors", "/api/v1/admin/supervisors/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/audit-logs/**").hasRole("ADMIN")

                        // 🟢 STEP 3: Restricted Mutations (Admin Only)
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // 🟢 STEP 4: Role-Specific Context (Supervisor)
                        .requestMatchers("/api/v1/supervisor/**").hasAnyRole("ADMIN", "SUPERVISOR")
                        .requestMatchers("/api/v1/requisitions/**").hasAnyRole("ADMIN", "SUPERVISOR")

                        // 🟢 STEP 5: Catch-all
                        .anyRequest().authenticated())

                // 🔒 Hardened Interception (401 & 403)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(auditEntryPoint)
                        .accessDeniedHandler(auditAccessDeniedHandler)
                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(auditLoggingFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 🔒 C3.2: Strict CORS — Zero wildcard policy.
     * Only explicit, trusted origins are permitted with credentials.
     * maxAge=3600 reduces preflight requests without exposing the config window.
     */
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ NEVER use "*" in production — blocks credential theft via CSRF
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",                          // Vite dev
                "http://localhost:5174",                          // Vite dev alt
                "http://localhost:5175",                          // Vite dev alt
                "https://mad-frontend-app.onrender.com"          // Render Production
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}