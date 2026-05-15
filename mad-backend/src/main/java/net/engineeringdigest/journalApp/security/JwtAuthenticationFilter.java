package net.engineeringdigest.journalApp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getParameter("token") != null) {
            // 🎫 Support for SSE/EventSource which doesn't allow custom headers
            token = request.getParameter("token");
        }

        if (token != null) {
            String username = null;

            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                logger.error("Error extracting username from token", e);
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 1. Load the user details (Which now includes the correct ROLE)
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 2. Validate token
                if (jwtUtil.validateToken(token, userDetails.getUsername())) {

                    // 🔍 DEBUG: Print authorities to console to verify the fix
                    log.debug("✅ User: {} | Authorities: {}", username, userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities() // <--- CRITICAL: Passing authorities here
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}