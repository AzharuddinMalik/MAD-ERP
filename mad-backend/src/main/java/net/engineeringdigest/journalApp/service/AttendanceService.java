package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.model.Attendance;
import net.engineeringdigest.journalApp.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AttendanceService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * Safely retrieves all attendance records for a project.
     * Prevents 500 server errors by catching data integrity issues.
     */
    public List<Attendance> getAttendanceByProject(Long projectId) {
        try {
            return attendanceRepository.findByProjectId(projectId);
        } catch (Exception e) {
            logger.error("Failed to fetch attendance for project {}: {}", projectId, e.getMessage());
            // Safe fallback to prevent bubbling up 500
            return Collections.emptyList();
        }
    }
}
