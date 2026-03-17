package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.BillOfQuantity;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.repository.BillOfQuantityRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private BillOfQuantityRepository boqRepository;

    // Endpoint for Client View (No Auth Required)
    // Matches ClientView.jsx: api.get(`/public/project/${projectId}`)
    @GetMapping("/project/{id}")
    public ResponseEntity<?> getPublicProjectDetails(@PathVariable Long id) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            List<BillOfQuantity> boqList = boqRepository.findByProjectId(id);

            Map<String, Object> response = new HashMap<>();

            // Send only safe data
            Map<String, Object> projectData = new HashMap<>();
            projectData.put("name", project.getName());
            projectData.put("clientName", project.getClientName());
            projectData.put("location", project.getLocation());
            projectData.put("startDate", project.getStartDate());
            projectData.put("status", project.getStatus());

            response.put("project", projectData);
            response.put("boq", boqList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}