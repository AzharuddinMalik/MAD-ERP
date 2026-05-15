package net.engineeringdigest.journalApp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VendorAuditDTO {
    private Long requisitionId;
    private String itemName;
    private Double quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalCost;
    private LocalDateTime date;
    private String status;
    private Integer receivedQuantity;
}
