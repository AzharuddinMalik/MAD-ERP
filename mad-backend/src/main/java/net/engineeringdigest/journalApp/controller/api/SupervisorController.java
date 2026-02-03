package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.model.SiteUpdate;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.repository.SiteUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/supervisor")
// Allow both Supervisors (to work) and Admins (to debug)
@PreAuthorize("hasRole('SUPERVISOR')") // ✅ Secure the WHOLE Class
public class SupervisorController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SiteUpdateRepository siteUpdateRepository;

    @GetMapping("/my-projects")
    public ResponseEntity<?> getMyProjects() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(projectRepository.findBySupervisor_Username(username));
    }

    /**
     * 🟢 NEW: Weekly Update Endpoint
     * Allows a supervisor to report progress on THEIR assigned project.
     */
    @PostMapping("/weekly-update")
    public ResponseEntity<?> postWeeklyUpdate(
            @RequestBody net.engineeringdigest.journalApp.dto.auth.WeeklyUpdateDTO updateDTO) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            // Debugging: Print who is trying to access
            System.out
                    .println("User: " + username + " is attempting update on Project ID: " + updateDTO.getProjectId());
            System.out
                    .println("Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());

            // 1. Fetch Project
            Project project = projectRepository.findById(updateDTO.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // 2. SECURITY CHECK
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN"));

            // Check if user owns the project (Supervisor must match)
            if (!isAdmin) {
                if (project.getSupervisor() == null || !project.getSupervisor().getUsername().equals(username)) {
                    return ResponseEntity.status(403).body("You are not authorized to update this project.");
                }
            }

            // 3. Update Project
            project.setLabourCount(updateDTO.getLabourCount());

            // Auto-Start logic
            if (updateDTO.getLabourCount() > 0
                    && project.getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.ON_HOLD) {
                project.setStatus(net.engineeringdigest.journalApp.model.ProjectStatus.RUNNING);
            }
            projectRepository.save(project);

            // 4. Log History
            SiteUpdate update = new SiteUpdate();
            update.setProject(project);
            update.setContent(
                    "Weekly Report: " + updateDTO.getLabourCount() + " avg workers. Notes: " + updateDTO.getRemark());
            update.setUpdateTime(LocalDateTime.now());
            siteUpdateRepository.save(update);

            return ResponseEntity.ok("Weekly update recorded successfully.");

        } catch (Exception e) {
            e.printStackTrace(); // Look at console if this fails
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Autowired
    private net.engineeringdigest.journalApp.service.FileStorageService fileStorageService;

    @PreAuthorize("hasRole('SUPERVISOR')")
    @PostMapping("/daily-update")
    public ResponseEntity<?> dailyProjectUpdate(
            @RequestParam("projectId") Long projectId,
            @RequestParam("labourCount") int labourCount,
            @RequestParam("remark") String remark,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "photo1", required = false) org.springframework.web.multipart.MultipartFile photo1,
            @RequestParam(value = "photo2", required = false) org.springframework.web.multipart.MultipartFile photo2) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            project.setLabourCount(labourCount);
            
            // Update Status if provided
            if (status != null && !status.isEmpty()) {
                try {
                    project.setStatus(net.engineeringdigest.journalApp.model.ProjectStatus.valueOf(status));
                } catch (IllegalArgumentException e) {
                   // Ignore invalid status for now, or log it
                   System.out.println("Invalid status received: " + status);
                }
            } else if (labourCount > 0
                    && project.getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.ON_HOLD) {
                // Legacy auto-start logic (only if status NOT manually provided)
                project.setStatus(net.engineeringdigest.journalApp.model.ProjectStatus.RUNNING);
            }
            projectRepository.save(project);

            SiteUpdate update = new SiteUpdate();
            update.setProject(project);
            update.setContent("Daily Report: " + labourCount + " workers. Remark: " + remark);
            update.setUpdateTime(LocalDateTime.now());

            // Handle File Uploads
            if (photo1 != null && !photo1.isEmpty()) {
                String url1 = fileStorageService.saveFile(photo1);
                update.setPhotoUrl1(url1);
            }
            if (photo2 != null && !photo2.isEmpty()) {
                String url2 = fileStorageService.saveFile(photo2);
                update.setPhotoUrl2(url2);
            }

            siteUpdateRepository.save(update);
            return ResponseEntity.ok("Daily update recorded with photos.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}