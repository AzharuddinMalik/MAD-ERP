package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cities")
@Data
@NoArgsConstructor
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Jaipur", "Mumbai"

    @Column(nullable = false)
    private boolean isActive = true; // If you stop operations in a city, set false.

    // 🟢 NEW: State (e.g., "Rajasthan", "Maharashtra")
    private String state;

    // Boilerplate for auditing
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}