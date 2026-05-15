package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name; // Maps to UI's projectName via DTO

    @Column(name = "client_name", nullable = false, length = 100)
    private String clientName;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private ProjectStatus status = ProjectStatus.RUNNING;

    private LocalDate startDate;

    private int labourCount;

    // 🔥 CRITICAL: LAZY prevents N+1 JOINs on list endpoints
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User supervisor;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
