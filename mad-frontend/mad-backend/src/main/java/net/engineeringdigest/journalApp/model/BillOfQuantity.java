package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "bill_of_quantities")
@Data
@NoArgsConstructor
public class BillOfQuantity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String itemName; // "False Ceiling - Hall"

    private String unit; // "SFT"

    // Added to satisfy DB constraint (NOT NULL)
    private double materialRequiredPerUnit = 0.0;

    @Column(name = "total_material_used")
    private double totalMaterialUsed = 0.0;

    // --- BUDGET / QUOTATION DATA ---
    private double totalScope; // The "Budgeted" quantity

    private double rate; // Agreed Rate (e.g., 105.0)

    // --- ACTUAL / SITE DATA ---
    private double completedScope; // The "Actual" quantity from measurements

    // --- METADATA ---
    private LocalDateTime lastUpdated;

    // Optional: GST Rate for Billing (Default 18%)
    private double gstRate = 18.0;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    // Helper to see "Value of Work Done"
    public double getCurrentBillValue() {
        return completedScope * rate;
    }
}