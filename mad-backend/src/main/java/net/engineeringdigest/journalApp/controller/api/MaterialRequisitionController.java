package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.MaterialRequisition;
import net.engineeringdigest.journalApp.service.MaterialRequisitionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ✅ H3 FIX: Controller is now a thin pass-through.
 * All business logic has been extracted to MaterialRequisitionService.
 */
@RestController
@RequestMapping("/api/v1/requisitions")
public class MaterialRequisitionController {

    private static final Logger log = LoggerFactory.getLogger(MaterialRequisitionController.class);

    @Autowired
    private MaterialRequisitionService requisitionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<?> submitRequest(@RequestBody MaterialRequisition requisition) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            MaterialRequisition saved = requisitionService.submit(requisition, username);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error submitting requisition: ", e);
            String message = e.getMessage();
            if (e.getCause() != null) {
                message += " | Cause: " + e.getCause().getMessage();
            }
            return ResponseEntity.status(500).body("Internal Error: " + message);
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public List<MaterialRequisition> getMyRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return requisitionService.getByRequester(username);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public List<MaterialRequisition> getAllRequests() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("🔍 ACCESS CHECK | User: {} | Authorities: {} | Path: /api/requisitions/all",
            auth.getName(), auth.getAuthorities());
        return requisitionService.getAll();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaterialRequisition> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(requisitionService.updateStatus(id, status, remarks));
    }

    @PatchMapping("/{id}/assign-vendor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaterialRequisition> assignVendor(
            @PathVariable Long id,
            @RequestParam Long vendorId,
            @RequestParam java.math.BigDecimal unitPrice,
            @RequestParam java.math.BigDecimal totalCost,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(requisitionService.assignVendor(id, vendorId, unitPrice, totalCost, authentication.getName()));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<MaterialRequisition> receiveMaterial(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(requisitionService.receiveMaterial(id, quantity, authentication.getName()));
    }
}
