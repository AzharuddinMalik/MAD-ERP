package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
public class Project {

    private int labourCount;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Villa 405 Renovation"

    @Column(nullable = false)
    private String clientName;

    // 🟢 UPDATED: Address Breakdown
    private String location; // Specific address (e.g., "Banjara Hills, Rd 12")
    private String plotNo;
    private String colony;
    private String pincode;
    private String district;
    private String state;

    // 🟢 NEW: Project Specifications
    private String projectType; // "G+3", "Commercial", "Villa"
    private Double squareFeet;
    private Double budget; // In raw numbers, UI converts to Lakh/Crore

    // 🟢 NEW: Compliance & Docs
    private String reraNumber;
    private String fireNocNumber;
    private String municipalApprovalUrl; // URL to uploaded doc
    private String labourLicenseUrl; // URL to uploaded doc

    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.RUNNING;

    private LocalDate startDate;

    // 🔥 NEW: Link to City
    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    // 🔥 NEW: Link to Supervisor (User)
    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
