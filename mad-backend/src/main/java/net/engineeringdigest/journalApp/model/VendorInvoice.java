package net.engineeringdigest.journalApp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendor_invoices")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VendorInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    private LocalDateTime invoiceDate;
    
    private LocalDateTime dueDate;

    private String paymentTerms;

    @Column(columnDefinition = "TEXT")
    private String gstBreakdown; // JSON string

    private BigDecimal totalAmount;

    @Column(length = 20)
    private String status = "DRAFT"; // DRAFT, ISSUED, PAID

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VendorInvoiceItem> lineItems = new ArrayList<>();

    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
        if (invoiceDate == null) invoiceDate = LocalDateTime.now();
    }
}
