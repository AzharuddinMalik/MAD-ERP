package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.BillOfQuantity;
import net.engineeringdigest.journalApp.model.LeadInquiry;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.repository.BillOfQuantityRepository;
import net.engineeringdigest.journalApp.repository.LeadInquiryRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.service.NotificationService;
import net.engineeringdigest.journalApp.exception.BusinessRuleException;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private BillOfQuantityRepository boqRepository;

    @Autowired
    private LeadInquiryRepository leadInquiryRepository;

    @Autowired
    private NotificationService notificationService;

    // Endpoint for Client View (No Auth Required)
    // Matches ClientView.jsx: api.get(`/public/project/${projectId}`)
    @GetMapping("/project/{id}")
    public ResponseEntity<?> getPublicProjectDetails(@PathVariable Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

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
    }

    // Endpoint to Submit Leads (Hero form / Contact form)
    @PostMapping("/leads")
    public ResponseEntity<?> submitLead(@RequestBody LeadInquiry lead) {
        if (lead.getName() == null || lead.getPhone() == null) {
            throw new BusinessRuleException("ERR_VALIDATION_FAILED", "Name and phone are required");
        }
        leadInquiryRepository.save(lead);

            // 📩 Send email notification to Admin asynchronously
            new Thread(() -> {
                notificationService.sendNewLeadNotification(lead);
            }).start();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Lead submitted successfully");
        return ResponseEntity.ok(response);
    }
}