package net.engineeringdigest.journalApp.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.engineeringdigest.journalApp.dto.ProjectRequestDTO;
import net.engineeringdigest.journalApp.model.City;
import net.engineeringdigest.journalApp.model.ProjectStatus;
import net.engineeringdigest.journalApp.repository.CityRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 Phase 2 Test: Project API Integration
 * Uses @Transactional to auto-rollback after each test, preventing unique constraint violations.
 * Validates API contracts, RBAC enforcement, and paginated DTO response structure.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional // Auto-rollback after each test prevents data leakage between tests
class ProjectApiIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;
    @Autowired CityRepository cityRepo;
    @Autowired ProjectRepository projectRepo;

    private City testCity;

    @BeforeEach
    void seedTestData() {
        City city = new City();
        city.setName("Test City");
        // isActive defaults to true, no setter needed
        testCity = cityRepo.save(city);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void B2_5_GET_projects_returnsPaginatedDTO() throws Exception {
        mockMvc.perform(get("/api/v1/projects?page=0&size=10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.totalPages").exists());
    }

    @Test
    @WithMockUser(username = "supervisor", roles = {"SUPERVISOR"})
    void B2_6_POST_project_withInvalidRole_returns403() throws Exception {
        ProjectRequestDTO dto = new ProjectRequestDTO(
            "Test", "Client", "Loc", testCity.getId(), null, LocalDate.now(), 5, ProjectStatus.RUNNING);
        
        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void B2_11_POST_project_validDto_returns201() throws Exception {
        ProjectRequestDTO dto = new ProjectRequestDTO(
            "Integration Test", "Client Y", "Test Location", testCity.getId(), null, 
            LocalDate.now().plusDays(1), 15, ProjectStatus.RUNNING);
        
        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(dto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.projectName").value("Integration Test"));
    }
}
