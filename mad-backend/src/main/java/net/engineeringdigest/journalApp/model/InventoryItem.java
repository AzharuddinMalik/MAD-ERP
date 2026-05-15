package net.engineeringdigest.journalApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 🧱 Enterprise Resource: Inventory Item (Materials)
 */
@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
// ✅ H1 FIX: Prevent Hibernate lazy proxy serialization errors
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ M3 FIX: Validation annotations to prevent invalid data
    @NotBlank(message = "Item name is required")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String category; // e.g., MASONRY, ELECTRICAL, PLUMBING

    @Column(name = "unit_of_measure", length = 20)
    private String unitOfMeasure; // e.g., BAGS, KG, METERS

    @Min(value = 0, message = "Minimum stock level cannot be negative")
    @Column(name = "minimum_stock_level")
    private double minimumStockLevel;

    @Min(value = 0, message = "Current quantity cannot be negative")
    @Column(name = "current_quantity")
    private double currentQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(length = 255)
    private String description;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
