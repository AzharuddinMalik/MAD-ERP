package net.engineeringdigest.journalApp.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.engineeringdigest.journalApp.dto.auth.LoginRequest;
import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.model.Role;
import net.engineeringdigest.journalApp.repository.UserRepository;
import net.engineeringdigest.journalApp.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();
        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole = roleRepository.save(adminRole);

        User user = new User();
        user.setUsername("admin123");
        user.setPasswordHash(passwordEncoder.encode("password"));
        user.setRole(adminRole);
        userRepository.save(user);
    }

    @Test
    void login_withValidCreds_returns200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin123");
        request.setPassword("password");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void login_withInvalidCreds_returns401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin123");
        request.setPassword("wrong");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
