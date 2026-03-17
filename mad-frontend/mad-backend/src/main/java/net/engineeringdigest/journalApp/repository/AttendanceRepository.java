package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // Check if a worker has attendance for today
    List<Attendance> findByLabourIdAndDate(Long labourId, LocalDate date);

    // Fuzzy Check: Find attendance by Worker Name and Date (for cross-project
    // validation)
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Attendance a WHERE lower(a.labour.name) = lower(:name) AND a.date = :date")
    List<Attendance> findByLabourNameAndDate(String name, LocalDate date);

    // Get attendance list for a project on a specific date
    List<Attendance> findByProjectIdAndDate(Long projectId, LocalDate date);

    // Get all attendance records in a date range (for charts)
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    long countByDateAndStatus(LocalDate date, String status);
}
