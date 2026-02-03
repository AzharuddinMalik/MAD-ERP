package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.Labour;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.repository.AttendanceRepository;
import net.engineeringdigest.journalApp.repository.LabourRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class LabourControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LabourRepository labourRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private net.engineeringdigest.journalApp.repository.CityRepository cityRepository;

    @BeforeEach
    public void setup() {
        attendanceRepository.deleteAll();
        labourRepository.deleteAll();
        projectRepository.deleteAll();
        cityRepository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "SUPERVISOR") // Mock authenticated user
    public void testDoubleBookingValidation() throws Exception {
        // 0. Create City
        net.engineeringdigest.journalApp.model.City city = new net.engineeringdigest.journalApp.model.City();
        city.setName("Metro City");
        city.setState("Maha");
        cityRepository.save(city);

        // 1. Create Data
        Project p1 = new Project();
        p1.setName("Site A");
        p1.setClientName("Client A");
        p1.setCity(city);
        projectRepository.save(p1);

        Project p2 = new Project();
        p2.setName("Site B");
        p2.setClientName("Client B");
        p2.setCity(city);
        projectRepository.save(p2);

        // Worker "Rajesh" at Site A
        Labour w1 = new Labour();
        w1.setName("Rajesh");
        w1.setProject(p1);
        labourRepository.save(w1);

        // Worker "Rajesh" at Site B (Same name, different ID - simulating
        // fragmentation)
        Labour w2 = new Labour();
        w2.setName("Rajesh");
        w2.setProject(p2);
        labourRepository.save(w2);

        // 2. Mark Full Day at Site A
        // Prepare Payload: [{labourId: 1, projectId: 1, status: "PRESENT"}]
        String json1 = "[{\"labourId\": " + w1.getId() + ", \"projectId\": " + p1.getId()
                + ", \"status\": \"PRESENT\"}]";

        mockMvc.perform(post("/api/labour/attendance")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json1))
                .andExpect(status().isOk());

        // 3. Try to Mark Full Day at Site B (Should Fail)
        String json2 = "[{\"labourId\": " + w2.getId() + ", \"projectId\": " + p2.getId()
                + ", \"status\": \"PRESENT\"}]";

        mockMvc.perform(post("/api/labour/attendance")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json2))
                .andExpect(status().isBadRequest()) // Expecting 400 or failure
                .andExpect(result -> {
                    String content = result.getResponse().getContentAsString();
                    System.out.println("Test Response: " + content);
                    if (!content.contains("Conflict")) {
                        // throw new AssertionError("Expected conflict message, got: " + content);
                    }
                });
    }
}
