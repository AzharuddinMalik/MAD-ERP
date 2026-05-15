package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.dto.DashboardResponseDTO;
import net.engineeringdigest.journalApp.dto.auth.ProjectDTO;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import net.engineeringdigest.journalApp.model.*;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.model.SiteUpdate;
import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.model.LeadInquiry;
import net.engineeringdigest.journalApp.repository.AttendanceRepository;
import net.engineeringdigest.journalApp.repository.BillOfQuantityRepository;
import net.engineeringdigest.journalApp.repository.CityRepository;
import net.engineeringdigest.journalApp.repository.LabourRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.repository.ProjectInvoiceRepository;
import net.engineeringdigest.journalApp.repository.SiteUpdateRepository;
import net.engineeringdigest.journalApp.repository.UserRepository; // ✅ ADDED IMPORT
import net.engineeringdigest.journalApp.repository.LeadInquiryRepository;
import net.engineeringdigest.journalApp.model.ProjectInvoice;
import net.engineeringdigest.journalApp.service.ProjectService;
import net.engineeringdigest.journalApp.service.ProjectMigrationService; // ✅ ADDED
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class AdminController {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectMigrationService migrationService; // ✅ ADDED

    @Autowired
    private UserRepository userRepository;

    // ✅ ADD THESE REPOSITORIES
    @Autowired
    private BillOfQuantityRepository boqRepository;

    @Autowired
    private LabourRepository labourRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeadInquiryRepository leadInquiryRepository;

    @Autowired
    private ProjectInvoiceRepository invoiceRepository;

    @Autowired
    private net.engineeringdigest.journalApp.repository.AuditLogRepository auditLogRepository;

    private final ProjectRepository projectRepository;
    private final SiteUpdateRepository siteUpdateRepository;

    // Constructor Injection for some fields
    public AdminController(ProjectRepository projectRepository, SiteUpdateRepository siteUpdateRepository) {
        this.projectRepository = projectRepository;
        this.siteUpdateRepository = siteUpdateRepository;
    }

    // 🟢 Project list/creation logic has been moved to ProjectController (/api/v1/projects)
    // to enforce strict DTO validation and pagination.

    // ✅ NEW ENDPOINT: Get Single Project (for Edit/Audit)
    @GetMapping("/projects/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NEW ENDPOINT: Add City (Admin Only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/cities")
    public ResponseEntity<?> addCity(@RequestBody net.engineeringdigest.journalApp.model.City city) {
        try {
            if (city.getState() == null || city.getState().isEmpty()) {
                return ResponseEntity.badRequest().body("State is required");
            }
            return ResponseEntity.ok(cityRepository.save(city));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding city: " + e.getMessage());
        }
    }

    // ✅ NEW ENDPOINT: Get Cities (for the Create Project dropdown)
    @GetMapping("/cities")
    public ResponseEntity<?> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    // ✅ NEW: Get All Supervisors for Dropdown
    @GetMapping("/supervisors")
    public List<User> getAllSupervisors() {
        // Now 'userRepository' is defined and will work
        List<User> supervisors = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && 
                    (u.getRole().getName().endsWith("SUPERVISOR")))
                .collect(Collectors.toList());

        // ✅ M2 FIX: Use targeted count query instead of loading all projects into memory
        for (User info : supervisors) {
            long count = projectRepository.countBySupervisor_IdAndStatus(
                    info.getId(), ProjectStatus.RUNNING);
            info.setProjectCount(count);
        }

        return supervisors;
    }

    /**
     * 🚜 SECURE ENDPOINT: Trigger Legacy Migration
     * Strictly Admin-only. Migrates data from 'cms' to 'madcms' with fail-safes.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/migrate-legacy-data")
    public ResponseEntity<String> migrateLegacyData() {
        try {
            String result = migrationService.migrateProjects();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Migration failed: " + e.getMessage());
        }
    }

    @Autowired
    private net.engineeringdigest.journalApp.service.FileStorageService fileStorageService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/post-update")
    public ResponseEntity<?> postSiteUpdate(
            @RequestParam("projectId") Long projectId,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            SiteUpdate update = new SiteUpdate();
            update.setProject(project);
            update.setContent(content);
            update.setUpdateTime(LocalDateTime.now());
            // ✅ H5 FIX: Use shared FileStorageService (external configurable path)
            if (file != null && !file.isEmpty()) {
                String filename = fileStorageService.saveFile(file);
                update.setPhotoUrl1("/uploads/" + filename);
            }
            siteUpdateRepository.save(update);
            return ResponseEntity.ok().body("{\"message\": \"Update saved successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-project")
    public ResponseEntity<?> updateProjectStatus(@RequestBody Project projectUpdate) {
        Project existing = projectRepository.findById((projectUpdate.getId()))
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (projectUpdate.getStatus() != null)
            existing.setStatus(projectUpdate.getStatus());
        if (projectUpdate.getLabourCount() >= 0)
            existing.setLabourCount(projectUpdate.getLabourCount());
        projectRepository.save(existing);
        return ResponseEntity.ok().body("{\"message\": \"Project updated\"}");
    }

    // 🟢 createProject logic has been moved to ProjectController (/api/v1/projects)
    // for strict Type Alignment and JSR 380 Validation.

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDTO> getDashboard() {
        return ResponseEntity.ok(projectService.getDashboardData());
    }

    // ✅ UPDATED DELETE METHOD WITH CASCADE LOGIC
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/projects/{id}")
    @Transactional // Ensures all deletes happen or none happen
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        // ✅ E1: Use ResourceNotFoundException instead of RuntimeException
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        // ✅ M1 FIX: Use targeted repository delete methods instead of findAll().stream().filter()
        attendanceRepository.deleteByProject_Id(id);
        labourRepository.deleteByProject_Id(id);
        boqRepository.findByProjectId(id).forEach(boqRepository::delete);
        siteUpdateRepository.deleteByProject_Id(id);

        projectRepository.delete(project);

        return ResponseEntity.ok().body("{\"message\": \"Project and all related data deleted successfully\"}");
    }

    // ✅ M5: Deprecated — use ProjectController (/api/v1/projects/{id}) for all project updates.
    // This endpoint will be removed in the next major version.
    @Deprecated(since = "v1.1", forRemoval = true)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectDTO projectDTO) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));

        existing.setName(projectDTO.getName());
        existing.setClientName(projectDTO.getClientName());
        existing.setStartDate(projectDTO.getStartDate());
        existing.setLocation(projectDTO.getLocation());

        if (projectDTO.getCityId() != null) {
            net.engineeringdigest.journalApp.model.City city = cityRepository.findById(projectDTO.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City", projectDTO.getCityId()));
            existing.setCity(city);
        }

        if (projectDTO.getSupervisorId() != null) {
            User supervisor = userRepository.findById(projectDTO.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supervisor", projectDTO.getSupervisorId()));
            existing.setSupervisor(supervisor);
        } else {
            existing.setSupervisor(null);
        }

        if (projectDTO.getStatus() != null) {
            existing.setStatus(projectDTO.getStatus());
        }

        projectRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    /**
     * 🟢 Endpoints: POST /api/admin/projects/{id}/finalize
     * Marks project as INVOICED and generates a financial record.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/projects/{id}/finalize")
    public ResponseEntity<?> finalizeProject(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            return ResponseEntity.ok(projectService.finalizeProject(id, authentication.getName(), isAdmin));
        } catch (IllegalStateException e) {
            // Return 409 Conflict if they hit the report constraint
            return ResponseEntity.status(409).body("Data Integrity Conflict: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error finalising project: " + e.getMessage());
        }
    }

    // ── LEADS MANAGEMENT ENPOINTS ──

    // Get all leads ordered by newest first
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping("/leads")
    public ResponseEntity<?> getAllLeads() {
        return ResponseEntity.ok(leadInquiryRepository.findAllByOrderBySubmittedAtDesc());
    }

    // Update lead status (e.g. NEW -> CONTACTED -> CLOSED)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/leads/{id}/status")
    public ResponseEntity<?> updateLeadStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            LeadInquiry lead = leadInquiryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Lead not found"));

            String newStatus = body.get("status");
            if (newStatus != null) {
                lead.setStatus(newStatus.toUpperCase());
                leadInquiryRepository.save(lead);
            }
            return ResponseEntity.ok(lead);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating lead: " + e.getMessage());
        }
    }

    // Get leads summary stats for the dashboard widget
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping("/leads/stats")
    public ResponseEntity<?> getLeadsStats() {
        try {
            LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            long todayCount = leadInquiryRepository.countBySubmittedAtBetween(startOfDay, endOfDay);
            long totalNew = leadInquiryRepository.countByStatus("NEW");
            long totalContacted = leadInquiryRepository.countByStatus("CONTACTED");
            long totalClosed = leadInquiryRepository.countByStatus("CLOSED");
            long totalAll = leadInquiryRepository.count();

            // Critical leads: Status is NEW and older than 24 hours
            LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
            long criticalCount = leadInquiryRepository.countByStatusAndSubmittedAtBefore("NEW", twentyFourHoursAgo);

            Map<String, Object> stats = new HashMap<>();
            stats.put("todayCount", todayCount);
            stats.put("totalNew", totalNew);
            stats.put("totalContacted", totalContacted);
            stats.put("totalClosed", totalClosed);
            stats.put("totalAll", totalAll);
            stats.put("criticalCount", criticalCount);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching lead stats: " + e.getMessage());
        }
    }

    // Get all system audit logs (Admin Only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }
}