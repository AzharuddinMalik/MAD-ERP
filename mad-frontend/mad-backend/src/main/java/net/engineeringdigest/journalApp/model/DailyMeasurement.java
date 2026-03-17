package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "daily_measurements")
@Data
@NoArgsConstructor
public class DailyMeasurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boq_id", nullable = false)
    private BillOfQuantity boqItem;

    private LocalDate date;
    private double length;
    private double height;       // Nullable for RFT items
    private double quantity;     // Calculated (L * H)

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private String supervisorName;
}