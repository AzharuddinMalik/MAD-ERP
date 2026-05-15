package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 🤝 Enterprise Engagement: Vendor (Suppliers)
 */
@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ M3 FIX: Validation annotations
    @NotBlank(message = "Vendor name is required")
    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(length = 20)
    private String phone;

    @Email(message = "Invalid email format")
    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(name = "gst_number", length = 20)
    private String gstNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_number", length = 30)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

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
