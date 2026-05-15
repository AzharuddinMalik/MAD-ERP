package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.BillOfQuantity;
import net.engineeringdigest.journalApp.model.DailyMeasurement;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.repository.BillOfQuantityRepository;
import net.engineeringdigest.journalApp.repository.DailyMeasurementRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.repository.SiteUpdateRepository;
import net.engineeringdigest.journalApp.service.LiveUpdateService;
import net.engineeringdigest.journalApp.service.ProjectService;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/measurements")
public class MeasurementController {

    @Autowired
    private BillOfQuantityRepository boqRepository;

    @Autowired
    private DailyMeasurementRepository measurementRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private net.engineeringdigest.journalApp.repository.SiteUpdateRepository siteUpdateRepository;

    @Autowired
    private LiveUpdateService notificationService;

    @Autowired
    private ProjectService projectService;

    // 1. Get Project BOQ (The "Plan")
    // Frontend calls: GET /api/measurements/project/{projectId}
    // 1. Get Project BOQ (The "Plan")
    // Frontend calls: GET /api/measurements/project/{projectId}
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectBOQ(@PathVariable Long projectId) {
        List<BillOfQuantity> boqList = boqRepository.findByProjectId(projectId);
        return ResponseEntity.ok(boqList);
    }

    // 2. Submit Daily Measurement (The "Work")
    // Frontend calls: POST /api/measurements/record
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @PostMapping("/record")
    public ResponseEntity<?> recordMeasurement(@RequestBody Map<String, Object> payload) {
            Long boqId = Long.parseLong(payload.get("boqId").toString());
            double length = Double.parseDouble(payload.get("length").toString());
            double width = payload.containsKey("width") ? Double.parseDouble(payload.get("width").toString()) : 0;
            String remarks = (String) payload.get("remarks");
            String supervisorName = (String) payload.get("supervisorName");

            BillOfQuantity boq = boqRepository.findById(boqId)
                    .orElseThrow(() -> new ResourceNotFoundException("BOQ Item", boqId));

            // Calculate Area
            double quantity = 0;
            if ("SFT".equalsIgnoreCase(boq.getUnit())) {
                quantity = length * width;
            } else if ("RFT".equalsIgnoreCase(boq.getUnit())) {
                quantity = length;
            } else {
                quantity = length; // Default fallback
            }

            // Update BOQ Total - Allow exceeding budget? For now, yes, but could warn.
            // Requirement says "System adds to completed_scope"

            // Save Record
            DailyMeasurement measurement = new DailyMeasurement();
            measurement.setBoqItem(boq);
            measurement.setDate(LocalDate.now());
            measurement.setLength(length);
            measurement.setHeight(width); // Mapping width to height/width field
            measurement.setQuantity(quantity);
            measurement.setRemarks(remarks);
            measurement.setSupervisorName(supervisorName);
            measurementRepository.save(measurement);

            // Update BOQ
            boq.setCompletedScope(boq.getCompletedScope() + quantity);
            boqRepository.save(boq);

            // 📢 NEW: Integrate with Site Updates & Real-time Live Feed
            net.engineeringdigest.journalApp.model.SiteUpdate update = new net.engineeringdigest.journalApp.model.SiteUpdate();
            update.setProject(boq.getProject());
            String text = String.format("Measurement recorded: %.2f %s for '%s' by %s. %s", 
                quantity, boq.getUnit(), boq.getItemName(), supervisorName, (remarks != null ? remarks : ""));
            update.setContent(text);
            update.setUpdateTime(java.time.LocalDateTime.now());
            net.engineeringdigest.journalApp.model.SiteUpdate savedUpdate = siteUpdateRepository.save(update);

            // 📡 Broadcast to Dashboard
            notificationService.broadcastSiteUpdate(projectService.mapToSiteUpdateDTO(savedUpdate));

            return ResponseEntity.ok("Measurement recorded: " + quantity + " " + boq.getUnit());
    }

    // 3. Add BOQ Item
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/boq")
    public ResponseEntity<?> addBOQItem(@RequestBody Map<String, Object> payload) {
            Long projectId = Long.parseLong(payload.get("projectId").toString());
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

            BillOfQuantity boq = new BillOfQuantity();
            boq.setProject(project);
            boq.setItemName((String) payload.get("itemName"));
            boq.setUnit((String) payload.get("unit"));
            boq.setTotalScope(Double.parseDouble(payload.get("totalScope").toString()));
            boq.setRate(Double.parseDouble(payload.get("rate").toString()));
            boq.setCompletedScope(0);

            boqRepository.save(boq);
            return ResponseEntity.ok(boq);
    }

    // 4. Update BOQ Item (PUT)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/boq/{id}")
    public ResponseEntity<?> updateBOQItem(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
            BillOfQuantity boq = boqRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("BOQ Item", id));

            if (payload.containsKey("itemName"))
                boq.setItemName((String) payload.get("itemName"));
            if (payload.containsKey("unit"))
                boq.setUnit((String) payload.get("unit"));
            if (payload.containsKey("totalScope"))
                boq.setTotalScope(Double.parseDouble(payload.get("totalScope").toString()));
            if (payload.containsKey("rate"))
                boq.setRate(Double.parseDouble(payload.get("rate").toString()));

            boqRepository.save(boq);
            return ResponseEntity.ok(boq);
    }

    // 5. Delete BOQ Item
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/boq/{id}")
    public ResponseEntity<?> deleteBOQItem(@PathVariable Long id) {
            if (!boqRepository.existsById(id)) {
                throw new ResourceNotFoundException("BOQ Item", id);
            }
            boqRepository.deleteById(id);
            return ResponseEntity.ok("BOQ Item deleted successfully");
    }
    // 6. Get BOQ Item History
    @GetMapping("/boq/{boqId}/history")
    public ResponseEntity<List<DailyMeasurement>> getBOQHistory(@PathVariable Long boqId) {
        return ResponseEntity.ok(measurementRepository.findByBoqItemIdOrderByDateDesc(boqId));
    }
}