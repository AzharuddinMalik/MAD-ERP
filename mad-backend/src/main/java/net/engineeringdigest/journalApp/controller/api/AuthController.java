package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.dto.auth.LoginRequest;
import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.repository.UserRepository;
import net.engineeringdigest.journalApp.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.debug("LOGIN API HIT: {}", request.getUsername());

            User user = userRepository.findByUsername(request.getUsername()).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
            }

            if (user.getRole() == null) {
                return ResponseEntity.status(500).body(Map.of("message", "User has no assigned role. Contact Admin."));
            }

            String token = jwtUtil.generateToken(
                    user.getUsername(),
                    user.getRole().getName()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", user.getRole().getName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Authentication error", e);
            return ResponseEntity.status(500).body(Map.of(
                "message", "Internal Server Error during authentication",
                "error", e.getMessage()
            ));
        }
    }
}
