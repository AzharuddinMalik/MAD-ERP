package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.Attendance;
import net.engineeringdigest.journalApp.model.Labour;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.repository.AttendanceRepository;
import net.engineeringdigest.journalApp.repository.LabourRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.service.AttendanceService;
import net.engineeringdigest.journalApp.exception.BusinessRuleException;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/labour")
// ✅ Security: Allow both Admin and Supervisor to manage labour
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class LabourController {

    @Autowired
    private LabourRepository labourRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private ProjectRepository projectRepository;

    // 1. Get Project Team
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getTeam(@PathVariable Long projectId) {
        // Optional: Add check if user is allowed to view this project
        return ResponseEntity.ok(labourRepository.findByProjectIdAndIsActiveTrue(projectId));
    }

    // 1.5 Get Project Attendance
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @GetMapping("/project/{projectId}/attendance")
    public ResponseEntity<?> getProjectAttendance(@PathVariable Long projectId) {
        // Safe fetch that will not crash on empty/invalid records
        return ResponseEntity.ok(attendanceService.getAttendanceByProject(projectId));
    }

    // 2. Add New Worker
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/add")
    public ResponseEntity<?> addWorker(@RequestBody Map<String, Object> payload) {
            Long projectId = Long.parseLong(payload.get("projectId").toString());
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

            if (project.getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.INVOICED) {
                throw new BusinessRuleException("ERR_PROJECT_FINALIZED", "Project is finalized. Cannot add worker.");
            }

            Labour labour = new Labour();
            labour.setName((String) payload.get("name"));
            labour.setType((String) payload.get("type"));
            labour.setDailyWage(Double.parseDouble(payload.get("wage").toString()));
            labour.setProject(project);
            labour.setIsActive(true); // Default active

            labourRepository.save(labour);
            return ResponseEntity.ok(labour);
    }

    // 3. Update Worker (PUT) - ✅ FIXES 403 / 405 Errors
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorker(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour", id));
        if (labour.getProject().getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.INVOICED) {
            throw new BusinessRuleException("ERR_PROJECT_FINALIZED", "Project is finalized. Cannot update worker.");
        }
        if (payload.containsKey("name"))
            labour.setName((String) payload.get("name"));
        if (payload.containsKey("type"))
            labour.setType((String) payload.get("type"));
        if (payload.containsKey("wage"))
            labour.setDailyWage(Double.parseDouble(payload.get("wage").toString()));

        labourRepository.save(labour);
        return ResponseEntity.ok("Worker updated successfully");
    }

    // 4. Delete Worker (DELETE) - ✅ FIXES 403 / 405 Errors
    // Uses "Soft Delete" by setting isActive = false
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorker(@PathVariable Long id) {
        Labour labour = labourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Labour", id));
        if (labour.getProject().getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.INVOICED) {
            throw new BusinessRuleException("ERR_PROJECT_FINALIZED", "Project is finalized. Cannot deactivate worker.");
        }
        labour.setIsActive(false);
        labourRepository.save(labour);
        return ResponseEntity.ok("Worker deactivated");
    }

    // 5. Mark Attendance (Bulk)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(@RequestBody List<Map<String, Object>> records) {
        for (Map<String, Object> record : records) {
                Long labourId = Long.parseLong(record.get("labourId").toString());
                Long projectId = Long.parseLong(record.get("projectId").toString());
                String status = (String) record.get("status");

                // Check if already marked for today to prevent duplicates
                // Check existing attendance for this worker today
                LocalDate today = LocalDate.now();

                // 1. Fetch current worker details to get Name
                Labour currentWorker = labourRepository.findById(labourId)
                        .orElseThrow(() -> new ResourceNotFoundException("Labour", labourId));

                // 2. Find ALL attendance records for ANY worker with this same name today
                List<Attendance> existingRecords = attendanceRepository.findByLabourNameAndDate(currentWorker.getName(),
                        today);

                // Find if there's a record for THIS project
                Attendance projectRecord = existingRecords.stream()
                        .filter(a -> a.getProject().getId().equals(projectId))
                        .findFirst()
                        .orElse(null);

                // Calculate load from OTHER projects
                double otherProjectLoad = existingRecords.stream()
                        .filter(a -> !a.getProject().getId().equals(projectId))
                        .mapToDouble(a -> getWorkLoad(a.getStatus()))
                        .sum();

                double newLoad = getWorkLoad(status);

                // Condition: Only block if adding load (newLoad > 0) causes overflow
                // This allows marking "ABSENT" (newLoad = 0) even if conflicts exist elsewhere
                if (newLoad > 0 && otherProjectLoad + newLoad > 1.0) {
                    throw new BusinessRuleException("ERR_ATTENDANCE_CONFLICT", "Conflict: '" + currentWorker.getName() + "' is already working "
                            + otherProjectLoad + " day(s) at another site today.");
                }

                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
                if (project.getStatus() == net.engineeringdigest.journalApp.model.ProjectStatus.INVOICED) {
                    throw new BusinessRuleException("ERR_PROJECT_FINALIZED", "Project is finalized. Cannot mark attendance.");
                }

                if (projectRecord != null) {
                    projectRecord.setStatus(status);
                    attendanceRepository.save(projectRecord);
                } else {
                    Attendance att = new Attendance();
                    att.setLabour(currentWorker);
                    att.setProject(project);
                    att.setDate(today);
                    att.setStatus(status);
                    attendanceRepository.save(att);
                }
            }
            return ResponseEntity.ok("Attendance Updated");
    }

    private double getWorkLoad(String status) {
        if ("PRESENT".equalsIgnoreCase(status))
            return 1.0;
        if ("HALF_DAY".equalsIgnoreCase(status))
            return 0.5;
        return 0.0;
    }
}
