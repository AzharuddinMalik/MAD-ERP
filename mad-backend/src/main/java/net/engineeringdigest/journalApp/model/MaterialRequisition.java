package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 📦 Enterprise Workflow: Material Requisition
 * Allows field supervisors to request materials for specific projects.
 */
@Entity
@Table(name = "material_requisitions")
@Data
@NoArgsConstructor
public class MaterialRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InventoryItem inventoryItem;

    @Column(name = "custom_item_name", length = 150)
    private String customItemName;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "unit_of_measure", length = 20)
    private String unitOfMeasure;

    @Column(length = 15)
    private String urgency = "NORMAL"; // NORMAL, URGENT, CRITICAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Vendor vendor;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, ASSIGNED, DISPATCHED, RECEIVED

    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "UNPAID"; // UNPAID, PARTIAL, PAID

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(precision = 10, scale = 2)
    private BigDecimal gstAmount;

    @Column(length = 10)
    private String currency = "INR";

    @Column(name = "received_quantity")
    private Integer receivedQuantity = 0;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
