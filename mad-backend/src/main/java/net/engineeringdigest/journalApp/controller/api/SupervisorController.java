package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.model.SiteUpdate;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.repository.SiteUpdateRepository;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import net.engineeringdigest.journalApp.service.LiveUpdateService;
import net.engineeringdigest.journalApp.service.ProjectService;

import java.time.LocalDateTime;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/supervisor")
// Allow both Supervisors (to work) and Admins (to debug)
@PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')") // ✅ Allow both roles
@Slf4j
public class SupervisorController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SiteUpdateRepository siteUpdateRepository;

    @Autowired
    private LiveUpdateService notificationService;

    @Autowired
    private ProjectService projectService;

    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @GetMapping("/my-projects")
    public ResponseEntity<?> getMyProjects() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(projectRepository.findBySupervisor_Username(username));
    }

    /**
     * 🟢 NEW: Weekly Update Endpoint
     * Allows a supervisor to report progress on THEIR assigned project.
     */
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @PostMapping("/weekly-update")
    public ResponseEntity<?> postWeeklyUpdate(
            @RequestBody net.engineeringdigest.journalApp.dto.auth.WeeklyUpdateDTO updateDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 1. Fetch Project
        Project project = projectRepository.findById(updateDTO.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", updateDTO.getProjectId()));

        // ✅ H2 FIX: Spring Security prefixes roles with "ROLE_". Was "ADMIN" (never matched).
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            // Check if user owns the project (Supervisor must match)
            if (!isAdmin) {
                if (project.getSupervisor() == null || !project.getSupervisor().getUsername().equals(username)) {
                    throw new org.springframework.security.access.AccessDeniedException("You are not authorized to update this project.");
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
            SiteUpdate savedUpdate = siteUpdateRepository.save(update);
            
            // 📡 Broadcast for Real-time Dashboard
            notificationService.broadcastSiteUpdate(projectService.mapToSiteUpdateDTO(savedUpdate));

            return ResponseEntity.ok("Weekly update recorded successfully.");
    }

    @Autowired
    private net.engineeringdigest.journalApp.service.FileStorageService fileStorageService;

    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @PostMapping("/daily-update")
    public ResponseEntity<?> dailyProjectUpdate(
            @RequestParam("projectId") Long projectId,
            @RequestParam("labourCount") int labourCount,
            @RequestParam("remark") String remark,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "photo1", required = false) org.springframework.web.multipart.MultipartFile photo1,
            @RequestParam(value = "photo2", required = false) org.springframework.web.multipart.MultipartFile photo2) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
            project.setLabourCount(labourCount);
            
            // Update Status if provided
            if (status != null && !status.isEmpty()) {
                try {
                    project.setStatus(net.engineeringdigest.journalApp.model.ProjectStatus.valueOf(status));
                } catch (IllegalArgumentException e) {
                   // Ignore invalid status for now, or log it
                   log.warn("Invalid status received: {}", status);
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
            try {
                if (photo1 != null && !photo1.isEmpty()) {
                    String url1 = fileStorageService.saveFile(photo1);
                    update.setPhotoUrl1(url1);
                }
                if (photo2 != null && !photo2.isEmpty()) {
                    String url2 = fileStorageService.saveFile(photo2);
                    update.setPhotoUrl2(url2);
                }
            } catch (java.io.IOException e) {
                log.error("Failed to save photo", e);
                throw new net.engineeringdigest.journalApp.exception.BusinessRuleException("ERR_FILE_UPLOAD", "Failed to upload photo: " + e.getMessage());
            }

            SiteUpdate savedUpdate = siteUpdateRepository.save(update);

            // 📡 Broadcast for Real-time Dashboard
            notificationService.broadcastSiteUpdate(projectService.mapToSiteUpdateDTO(savedUpdate));
            return ResponseEntity.ok("Daily update recorded with photos.");
    }
}