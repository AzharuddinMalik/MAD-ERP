package net.engineeringdigest.journalApp.dto.auth;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectDTO {
    private String name; // "Villa 405 Renovation"
    private String clientName; // "Mr. Sharma"
    private String location; // "Banjara Hills"
    private Long cityId; // 1 (for Jaipur)
    private LocalDate startDate; // "2026-01-10"

    // 🟢 NEW: Address Breakdown
    private String plotNo;
    private String colony;
    private String pincode;
    private String district;
    private String state;

    // 🟢 NEW: Project Specifications
    private String projectType;
    private Double squareFeet;
    private Double budget;

    // 🟢 NEW: Compliance
    private String reraNumber;
    private String fireNocNumber;

    // 🟢 NEW FIELD
    private Long supervisorId;

    // 🟢 NEW FIELD: Status (Optional for update)
    private net.engineeringdigest.journalApp.model.ProjectStatus status;
}