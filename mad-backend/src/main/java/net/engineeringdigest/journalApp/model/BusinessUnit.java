package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 🏢 Enterprise Core: Business Unit (Tenant/Organization)
 */
@Entity
@Table(name = "business_units")
@Data
@NoArgsConstructor
public class BusinessUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "registration_number", length = 50)
    private String registrationNumber;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
