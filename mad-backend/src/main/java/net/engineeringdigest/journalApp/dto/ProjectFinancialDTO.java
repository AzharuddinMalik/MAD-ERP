package net.engineeringdigest.journalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 💰 Financial Intelligence DTO
 * Summarizes project-wise ROI and expenses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFinancialDTO {
    private Long projectId;
    private String projectName;
    private BigDecimal totalBudget;     // Total BOQ Value (Scope * Rate)
    private BigDecimal workDoneValue;   // Value of work completed so far
    private BigDecimal materialExpense; // Sum of finalized material requisitions
    private BigDecimal labourExpense;   // Calculated from attendance and daily wages
    private BigDecimal totalExpense;    // Material + Labour
    private BigDecimal currentROI;      // workDoneValue - totalExpense
    private double healthScore;         // Percentage of budget remaining
}
