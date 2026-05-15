package net.engineeringdigest.journalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 🧾 Vendor Financial Statement DTO
 * Tracks total business volume and payment status per vendor.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorFinancialDTO {
    private Long vendorId;
    private String vendorName;
    private BigDecimal totalOrderValue; // Sum of all dispatched/received requisitions
    private BigDecimal totalPaid;       // Sum of requisitions marked as PAID
    private BigDecimal pendingBalance;  // totalOrderValue - totalPaid
    private int orderCount;             // Total number of requisitions
}
