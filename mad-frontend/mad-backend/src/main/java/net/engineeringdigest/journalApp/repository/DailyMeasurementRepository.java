package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.DailyMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyMeasurementRepository extends JpaRepository<DailyMeasurement, Long> {
    // Find all measurements for a specific BOQ item, ordered by date
    List<DailyMeasurement> findByBoqItemIdOrderByDateDesc(Long boqId);
}