package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "labour")
@Data
public class Labour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type; // e.g., "Mason", "Helper", "Carpenter"

    private Double dailyWage;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private Boolean isActive = true;
}