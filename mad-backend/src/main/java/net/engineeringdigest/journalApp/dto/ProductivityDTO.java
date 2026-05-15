package net.engineeringdigest.journalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * ⚡ Resource Productivity DTO
 * Tracks efficiency metrics for projects and supervisors.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductivityDTO {
    private Long projectId;
    private String projectName;
    private String supervisorName;
    
    // Labour Metrics
    private long totalManDays;
    private BigDecimal valueProducedPerManDay; // Total Work Value / Total Man-Days
    private double efficiencyScore;            // Percentile compared to company average
    
    // Material Metrics
    private BigDecimal materialWastageRatio;   // Actual Requisitions / BOQ Required
    private int wasteAlerts;                   // Count of flagged requisitions
    
    // Timeline Metrics
    private int daysRemaining;                 // Predicted days to finish
    private String predictedCompletionDate;
}
