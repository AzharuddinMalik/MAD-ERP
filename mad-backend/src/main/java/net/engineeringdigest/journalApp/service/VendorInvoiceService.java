package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.dto.VendorAuditDTO;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import net.engineeringdigest.journalApp.model.*;
import net.engineeringdigest.journalApp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorInvoiceService {

    @Autowired
    private VendorInvoiceRepository invoiceRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private MaterialRequisitionRepository requisitionRepository;

    @Autowired
    private LiveUpdateService liveUpdateService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private VendorInvoiceItemRepository invoiceItemRepository;

    /**
     * Get paginated vendor audit history with date filtering.
     */
    public Page<VendorAuditDTO> getVendorAudit(Long vendorId, LocalDateTime startDate, LocalDateTime endDate, String status, Pageable pageable) {
        List<MaterialRequisition> requisitions = requisitionRepository.findByVendorId(vendorId).stream()
                .filter(r -> startDate == null || (r.getCreatedAt() != null && r.getCreatedAt().isAfter(startDate)))
                .filter(r -> endDate == null || (r.getCreatedAt() != null && r.getCreatedAt().isBefore(endDate)))
                .filter(r -> status == null || status.isEmpty() || status.equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        List<VendorAuditDTO> dtos = requisitions.stream().map(r -> {
            VendorAuditDTO dto = new VendorAuditDTO();
            dto.setRequisitionId(r.getId());
            dto.setItemName(r.getInventoryItem() != null ? r.getInventoryItem().getName() : r.getCustomItemName());
            dto.setQuantity(r.getQuantity());
            dto.setUnit(r.getUnitOfMeasure());
            dto.setUnitPrice(r.getUnitPrice());
            dto.setTotalCost(r.getTotalCost());
            dto.setDate(r.getCreatedAt());
            dto.setStatus(r.getStatus());
            dto.setReceivedQuantity(r.getReceivedQuantity());
            return dto;
        }).collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dtos.size());
        
        if (start > dtos.size()) return new PageImpl<>(new ArrayList<>(), pageable, dtos.size());
        
        return new PageImpl<>(dtos.subList(start, end), pageable, dtos.size());
    }

    /**
     * Generate an invoice for a vendor based on selected requisitions.
     */
    @Transactional
    public VendorInvoice generateInvoice(Long vendorId, List<Long> requisitionIds, String actor) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", vendorId));

        VendorInvoice invoice = new VendorInvoice();
        invoice.setVendor(vendor);
        invoice.setInvoiceNumber("V-INV-" + System.currentTimeMillis());
        invoice.setStatus("DRAFT");
        
        BigDecimal total = BigDecimal.ZERO;
        List<VendorInvoiceItem> items = new ArrayList<>();

        // 🛡️ SECURITY: Prevent 409 Conflict by checking if any item is already invoiced
        for (Long reqId : requisitionIds) {
            boolean alreadyInvoiced = invoiceItemRepository.findAll().stream()
                    .anyMatch(item -> item.getRequisition() != null && item.getRequisition().getId().equals(reqId));
            
            if (alreadyInvoiced) {
                throw new net.engineeringdigest.journalApp.exception.BusinessRuleException(
                    "ERR_ALREADY_INVOICED", 
                    "Requisition #" + reqId + " has already been included in another invoice."
                );
            }
        }

        for (Long reqId : requisitionIds) {
            MaterialRequisition req = requisitionRepository.findById(reqId)
                    .orElseThrow(() -> new ResourceNotFoundException("Requisition", reqId));
            
            VendorInvoiceItem item = new VendorInvoiceItem();
            item.setInvoice(invoice);
            item.setRequisition(req);
            item.setAmount(req.getTotalCost());
            item.setDescription(req.getInventoryItem() != null ? req.getInventoryItem().getName() : req.getCustomItemName());
            
            total = total.add(req.getTotalCost() != null ? req.getTotalCost() : BigDecimal.ZERO);
            items.add(item);

            // ✅ Update requisition status to prevent double-invoicing
            req.setStatus("INVOICED");
            requisitionRepository.save(req);
        }

        invoice.setTotalAmount(total);
        invoice.setLineItems(items);
        
        VendorInvoice saved = invoiceRepository.save(invoice);
        
        auditLogService.saveAuditLog(actor, "INVOICE_GENERATED", "/api/v1/vendors/" + vendorId + "/invoice", 200, saved.getId(),
            "Generated invoice for " + vendor.getName() + ". Total: " + total);
            
        liveUpdateService.broadcastInvoiceGenerated(saved);
        
        return saved;
    }

    /**
     * Mark an invoice as ISSUED. Once issued, it becomes immutable.
     */
    @Transactional
    public VendorInvoice issueInvoice(Long invoiceId) {
        VendorInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
        
        invoice.setStatus("ISSUED");
        return invoiceRepository.save(invoice);
    }
}
