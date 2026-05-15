package net.engineeringdigest.journalApp.controller.api;

import lombok.RequiredArgsConstructor;
import net.engineeringdigest.journalApp.dto.ProjectFinancialDTO;
import net.engineeringdigest.journalApp.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import net.engineeringdigest.journalApp.dto.VendorFinancialDTO;
import net.engineeringdigest.journalApp.dto.ProductivityDTO;
import java.util.List;

/**
 * 🏦 Financial Intelligence Controller
 * Exposes endpoints for ROI and expense analysis.
 */
@RestController
@RequestMapping("/api/v1/admin/financials")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FinancialController {

    private final ProjectService projectService;

    @GetMapping("/summary")
    public ResponseEntity<List<ProjectFinancialDTO>> getFinancialSummary() {
        return ResponseEntity.ok(projectService.getAllFinancials());
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<VendorFinancialDTO>> getVendorFinancials() {
        return ResponseEntity.ok(projectService.getVendorFinancials());
    }

    @GetMapping("/productivity")
    public ResponseEntity<List<ProductivityDTO>> getProductivitySummary() {
        return ResponseEntity.ok(projectService.getAllProductivity());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProjectFinancialDTO> getProjectFinancials(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectFinancials(projectId));
    }

    @PostMapping("/requisition/{id}/pay")
    public ResponseEntity<?> markRequisitionAsPaid(@PathVariable Long id) {
        projectService.markRequisitionAsPaid(id);
        return ResponseEntity.ok().build();
    }
}
