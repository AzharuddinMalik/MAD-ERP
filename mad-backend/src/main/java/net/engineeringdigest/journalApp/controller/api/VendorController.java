package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.Vendor;
import net.engineeringdigest.journalApp.model.VendorInvoice;
import net.engineeringdigest.journalApp.repository.VendorRepository;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import net.engineeringdigest.journalApp.service.PdfGeneratorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/vendors")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class VendorController {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Cacheable("vendors")
    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "vendors", allEntries = true)
    public ResponseEntity<Vendor> addVendor(@Valid @RequestBody Vendor vendor) {
        return ResponseEntity.ok(vendorRepository.save(vendor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        return vendorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "vendors", allEntries = true)
    public ResponseEntity<Vendor> updateVendor(@PathVariable Long id, @Valid @RequestBody Vendor details) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));

        vendor.setName(details.getName());
        vendor.setContactPerson(details.getContactPerson());
        vendor.setPhone(details.getPhone());
        vendor.setEmail(details.getEmail());
        vendor.setAddress(details.getAddress());
        vendor.setGstNumber(details.getGstNumber());
        vendor.setBankName(details.getBankName());
        vendor.setAccountNumber(details.getAccountNumber());
        vendor.setIfscCode(details.getIfscCode());
        vendor.setPaymentTerms(details.getPaymentTerms());
        vendor.setActive(details.isActive());
        vendor.setNotes(details.getNotes());

        return ResponseEntity.ok(vendorRepository.save(vendor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "vendors", allEntries = true)
    public ResponseEntity<?> deleteVendor(@PathVariable Long id) {
        vendorRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private net.engineeringdigest.journalApp.service.VendorInvoiceService invoiceService;

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVendorAudit(
            @PathVariable Long id,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            org.springframework.data.domain.Pageable pageable) {
        
        java.time.LocalDateTime start = (startDate != null && !startDate.isEmpty()) 
                ? java.time.LocalDate.parse(startDate).atStartOfDay() : null;
        java.time.LocalDateTime end = (endDate != null && !endDate.isEmpty()) 
                ? java.time.LocalDate.parse(endDate).atTime(23, 59, 59) : null;
        
        return ResponseEntity.ok(invoiceService.getVendorAudit(id, start, end, status, pageable));
    }

    @PostMapping("/{id}/invoice")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateInvoice(
            @PathVariable Long id,
            @RequestBody java.util.List<Long> requisitionIds,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(invoiceService.generateInvoice(id, requisitionIds, authentication.getName()));
    }

    // ═══════════════════════════════════════════════════════════════
    // PDF DOWNLOAD ENDPOINTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Download an existing invoice as a PDF document.
     * GET /api/v1/admin/vendors/{vendorId}/invoice/{invoiceId}/pdf
     */
    @GetMapping("/{vendorId}/invoice/{invoiceId}/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable Long vendorId,
            @PathVariable Long invoiceId) {

        byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(invoiceId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"MAD-Invoice-" + invoiceId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }

    /**
     * Generate a new invoice from selected requisitions AND immediately return
     * the PDF in a single request. This is the primary endpoint used by the
     * frontend "Generate Invoice" button.
     * POST /api/v1/admin/vendors/{id}/invoice/pdf
     */
    @PostMapping("/{id}/invoice/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateAndDownloadInvoicePdf(
            @PathVariable Long id,
            @RequestBody java.util.List<Long> requisitionIds,
            org.springframework.security.core.Authentication authentication) {

        // 1. Create the invoice record
        VendorInvoice invoice = invoiceService.generateInvoice(id, requisitionIds, authentication.getName());

        // 2. Render to PDF
        byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(invoice.getId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"MAD-Invoice-" + invoice.getInvoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }
}

