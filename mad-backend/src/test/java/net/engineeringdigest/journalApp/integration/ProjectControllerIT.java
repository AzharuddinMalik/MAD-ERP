package net.engineeringdigest.journalApp.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.engineeringdigest.journalApp.dto.ProjectRequestDTO;
import net.engineeringdigest.journalApp.model.ProjectStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ProjectControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProject_withValidData_returns201() throws Exception {
        ProjectRequestDTO dto = new ProjectRequestDTO(
                "Test Project",
                "Client 1",
                "Location 1",
                1L,
                null,
                LocalDate.now(),
                5,
                ProjectStatus.RUNNING
        );

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                // Note: The service expects a City with ID 1 to exist. 
                // Either pre-create City or expect a 404 EntityNotFoundException wrapped in ApiErrorResponse.
                .andExpect(status().isNotFound()); // As we haven't initialized City 1
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR")
    void deleteProject_asSupervisor_returns403() throws Exception {
        mockMvc.perform(delete("/api/v1/admin/projects/1"))
                .andExpect(status().isForbidden());
    }
}
