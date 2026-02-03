package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.dto.auth.ProjectDTO;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.model.SiteUpdate;
import net.engineeringdigest.journalApp.model.User;
import net.engineeringdigest.journalApp.repository.AttendanceRepository;
import net.engineeringdigest.journalApp.repository.BillOfQuantityRepository;
import net.engineeringdigest.journalApp.repository.CityRepository;
import net.engineeringdigest.journalApp.repository.LabourRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.repository.SiteUpdateRepository;
import net.engineeringdigest.journalApp.repository.UserRepository; // ✅ ADDED IMPORT
import net.engineeringdigest.journalApp.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    // @Autowired
    // private ProjectRepository projectRepository;

    // @Autowired
    // private SiteUpdateRepository siteUpdateRepository;

    // ✅ ADD THESE REPOSITORIES
    @Autowired
    private BillOfQuantityRepository boqRepository;

    @Autowired
    private LabourRepository labourRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;
    private final ProjectRepository projectRepository;
    private final SiteUpdateRepository siteUpdateRepository;

    // Constructor Injection for some fields
    public AdminController(ProjectRepository projectRepository, SiteUpdateRepository siteUpdateRepository) {
        this.projectRepository = projectRepository;
        this.siteUpdateRepository = siteUpdateRepository;
    }

    // ✅ NEW ENDPOINT: Get All Projects for the Live View
    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    // ✅ NEW ENDPOINT: Get Single Project (for Edit/Audit)
    @GetMapping("/projects/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NEW ENDPOINT: Add City
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
                .filter(u -> u.getRole() != null && "ROLE_SUPERVISOR".equals(u.getRole().getName()))
                .collect(Collectors.toList());

        // Calculate Project Count for each
        // Optimally we would do this with a custom query countBySupervisorId but let's
        // do in-memory for small scale
        List<Project> activeProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.RUNNING)
                .collect(Collectors.toList());

        for (User info : supervisors) {
            long count = activeProjects.stream()
                    .filter(p -> p.getSupervisor() != null && p.getSupervisor().getId().equals(info.getId()))
                    .count();
            info.setProjectCount(count);
        }

        return supervisors;
    }

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
            if (file != null && !file.isEmpty()) {
                String projectDir = System.getProperty("user.dir");
                Path uploadPath = Paths.get(projectDir, "src", "main", "resources", "static", "uploads");
                if (!Files.exists(uploadPath))
                    Files.createDirectories(uploadPath);
                String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                file.transferTo(uploadPath.resolve(filename).toFile());
                update.setPhotoUrl1("/uploads/" + filename);
            }
            siteUpdateRepository.save(update);
            return ResponseEntity.ok().body("{\"message\": \"Update saved successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

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

    @PostMapping("/create-project")
    public ResponseEntity<?> createProject(@RequestBody ProjectDTO dto) {
        try {
            net.engineeringdigest.journalApp.model.City city = cityRepository.findById(dto.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            Project project = new Project();
            project.setName(dto.getName());
            project.setClientName(dto.getClientName());
            project.setStartDate(dto.getStartDate());
            project.setCity(city);

            // 🟢 Address Mappings
            project.setLocation(dto.getLocation()); // Using 'location' as generic or street address
            project.setPlotNo(dto.getPlotNo());
            project.setColony(dto.getColony());
            project.setPincode(dto.getPincode());
            project.setDistrict(dto.getDistrict());
            project.setState(dto.getState());

            // 🟢 Specs Mappings
            project.setProjectType(dto.getProjectType());
            project.setSquareFeet(dto.getSquareFeet());
            project.setBudget(dto.getBudget());

            // 🟢 Compliance Mappings
            project.setReraNumber(dto.getReraNumber());
            project.setFireNocNumber(dto.getFireNocNumber());

            project.setStatus(net.engineeringdigest.journalApp.model.ProjectStatus.RUNNING);
            project.setLabourCount(0);

            // Assign Supervisor if provided
            if (dto.getSupervisorId() != null) {
                User supervisor = userRepository.findById(dto.getSupervisorId())
                        .orElseThrow(() -> new RuntimeException("Supervisor not found"));
                project.setSupervisor(supervisor);
            }

            projectRepository.save(project);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("globalStats", projectService.getGlobalStats());
            dashboardData.put("cityStats", projectService.getProjectStats());
            dashboardData.put("alerts", projectService.getDashboardAlerts());
            dashboardData.put("recentUpdates", projectService.getRecentUpdates());
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ✅ UPDATED DELETE METHOD WITH CASCADE LOGIC
    @DeleteMapping("/projects/{id}")
    @Transactional // Ensures all deletes happen or none happen
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            Project project = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // 1. Delete Attendance linked to this Project
            // (Assumes you added a delete method in AttendanceRepository or we iterate)
            // Ideally: attendanceRepository.deleteByProjectId(id);
            // For now, let's fetch and delete to be safe if custom query missing
            attendanceRepository.findAll().stream()
                    .filter(a -> a.getProject().getId().equals(id))
                    .forEach(attendanceRepository::delete);

            // 2. Delete Labour linked to this Project
            // ✅ FIX: Use findAll() stream instead of findByProjectIdAndIsActiveTrue to
            // ensure INACTIVE workers are also deleted
            labourRepository.findAll().stream()
                    .filter(l -> l.getProject().getId().equals(id))
                    .forEach(labourRepository::delete);

            // 3. Delete BOQ Items
            boqRepository.findByProjectId(id)
                    .forEach(boqRepository::delete);

            // 4. Delete Site Updates
            siteUpdateRepository.findAll().stream()
                    .filter(u -> u.getProject().getId().equals(id))
                    .forEach(siteUpdateRepository::delete);

            // 5. Finally, Delete the Project
            projectRepository.delete(project);

            return ResponseEntity.ok().body("{\"message\": \"Project and all related data deleted successfully\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting project: " + e.getMessage());
        }
    }

    // ✅ NEW: Full Update Endpoint
    @PutMapping("/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectDTO projectDTO) {
        try {
            Project existing = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            // Update basic fields
            // Update basic fields
            existing.setName(projectDTO.getName());
            existing.setClientName(projectDTO.getClientName());
            existing.setStartDate(projectDTO.getStartDate());

            // 🟢 Update Address
            existing.setLocation(projectDTO.getLocation());
            if (projectDTO.getPlotNo() != null)
                existing.setPlotNo(projectDTO.getPlotNo());
            if (projectDTO.getColony() != null)
                existing.setColony(projectDTO.getColony());
            if (projectDTO.getPincode() != null)
                existing.setPincode(projectDTO.getPincode());
            if (projectDTO.getDistrict() != null)
                existing.setDistrict(projectDTO.getDistrict());
            if (projectDTO.getState() != null)
                existing.setState(projectDTO.getState());

            // 🟢 Update Specs
            if (projectDTO.getProjectType() != null)
                existing.setProjectType(projectDTO.getProjectType());
            if (projectDTO.getSquareFeet() != null)
                existing.setSquareFeet(projectDTO.getSquareFeet());
            if (projectDTO.getBudget() != null)
                existing.setBudget(projectDTO.getBudget());

            // 🟢 Update Compliance
            if (projectDTO.getReraNumber() != null)
                existing.setReraNumber(projectDTO.getReraNumber());
            if (projectDTO.getFireNocNumber() != null)
                existing.setFireNocNumber(projectDTO.getFireNocNumber());

            // Update City if changed
            if (projectDTO.getCityId() != null) {
                net.engineeringdigest.journalApp.model.City city = cityRepository.findById(projectDTO.getCityId())
                        .orElseThrow(() -> new RuntimeException("City not found"));
                existing.setCity(city);
            }

            // Update Supervisor if changed
            if (projectDTO.getSupervisorId() != null) {
                User supervisor = userRepository.findById(projectDTO.getSupervisorId())
                        .orElseThrow(() -> new RuntimeException("Supervisor not found"));
                existing.setSupervisor(supervisor);
            } else {
                existing.setSupervisor(null); // Allow clearing supervisor
            }

            // Note: Status is updated via a separate flow usually, but if DTO has it, we
            // could.
            // However, ProjectDTO doesn't usually carry status for creation.
            // Let's check if the USER want status editable here.
            // The user said: "Modify: Admin changes a field (e.g., Status from "RUNNING" to
            // "ON_HOLD")"
            // So we MUST handle status. ProjectDTO might need a status field or we check
            // the separate endpoint.
            // Let's look at ProjectDTO again. It DOES NOT have status.
            // We should probably add Status to ProjectDTO or handle it separately.
            // User request: "Field Why Edit? ... Status: Crucial."
            // I will ADD Status to ProjectDTO in the next step, for now I will comment it.

            // ✅ Update Status if provided
            if (projectDTO.getStatus() != null) {
                existing.setStatus(projectDTO.getStatus());
            }

            projectRepository.save(existing);
            return ResponseEntity.ok(existing);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating project: " + e.getMessage());
        }
    }
}