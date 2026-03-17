package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.model.*;
import net.engineeringdigest.journalApp.repository.AttendanceRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import net.engineeringdigest.journalApp.repository.SiteUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository repository;

    @Autowired
    private SiteUpdateRepository siteUpdateRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private net.engineeringdigest.journalApp.repository.LabourRepository labourRepository;

    public List<Project> getAllProjects() {
        List<Project> projects = repository.findAll();
        // 🟢 FIX: Populate dynamic labour count for each project
        for (Project p : projects) {
            long count = labourRepository.countByProject(p);
            p.setLabourCount((int) count);
        }
        return projects;
    }

    public List<SiteUpdate> getRecentUpdates() {
        return siteUpdateRepository.findTop10ByOrderByUpdateTimeDesc();
    }

    public List<CityStats> getProjectStats() {
        List<Project> allProjects = repository.findAll();
        List<CityStats> statsList = new ArrayList<>();

        Map<String, List<Project>> groupedByCity = allProjects.stream()
                .filter(p -> p.getCity() != null)
                .collect(Collectors.groupingBy(project -> project.getCity().getName()));

        for (Map.Entry<String, List<Project>> entry : groupedByCity.entrySet()) {
            String city = entry.getKey();
            List<Project> cityProjects = entry.getValue();

            long total = cityProjects.size();

            long running = cityProjects.stream()
                    .filter(p -> p.getStatus() == ProjectStatus.RUNNING)
                    .count();

            long completed = cityProjects.stream()
                    .filter(p -> p.getStatus() == ProjectStatus.COMPLETED)
                    .count();

            statsList.add(new CityStats(city, total, running, completed));
        }
        return statsList;
    }

    public Map<String, Object> getGlobalStats() {
        List<Project> allProjects = repository.findAll();

        Map<String, Object> response = new HashMap<>();

        response.put("totalProjects", (long) allProjects.size());

        // Dynamic Active Count (Reverting to include ALL non-completed for safety)
        long activeCount = allProjects.stream()
                .filter(p -> p.getStatus() != ProjectStatus.COMPLETED)
                .count();
        response.put("activeProjects", activeCount);

        // FIX: Use Total Labour Strength (Team Size) instead of Daily Attendance
        // This ensures the number is stable (e.g., 3 assigned workers) even if
        // attendance isn't marked today.
        long totalLabour = labourRepository.count();
        response.put("totalLabour", totalLabour);

        long cityCount = allProjects.stream()
                .filter(p -> p.getCity() != null)
                .map(p -> p.getCity().getName())
                .distinct()
                .count();
        response.put("cityCount", cityCount);

        // --- NEW: Project Status Distribution ---
        Map<String, Long> statusDist = allProjects.stream()
                .filter(p -> p.getStatus() != null)
                .collect(Collectors.groupingBy(p -> p.getStatus().toString(), Collectors.counting()));
        response.put("projectStatusDistribution", statusDist);

        // --- NEW: Weekly Labour Trend (Last 7 Days) ---
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        // Fetch all attendance records once for the range
        List<Attendance> recentAttendance = attendanceRepository.findByDateBetween(startDate, today);

        // Group by Date
        Map<LocalDate, Long> attendanceByDate = recentAttendance.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()) ||
                        "HALF_DAY".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.groupingBy(
                        Attendance::getDate,
                        Collectors.counting()));

        // Fill in the last 7 days (even if count is 0)
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE"); // "Mon", "Tue"
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long count = attendanceByDate.getOrDefault(d, 0L);
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("day", d.format(dayFormatter));
            dayStat.put("date", d.toString());
            dayStat.put("workers", count);
            trend.add(dayStat);
        }
        response.put("weeklyLabourTrend", trend);

        return response;
    }

    public List<Map<String, String>> getDashboardAlerts() {
        List<Project> projects = repository.findAll();
        List<Map<String, String>> alerts = new ArrayList<>();

        for (Project p : projects) {
            ProjectStatus status = p.getStatus();
            if (status == null)
                continue;

            if (status == ProjectStatus.DELAYED) {
                Map<String, String> alert = new HashMap<>();
                alert.put("type", "error");
                alert.put("title", "Project Delayed: " + p.getName());
                alert.put("message", "Immediate attention required.");
                alerts.add(alert);
            } else if (status == ProjectStatus.ON_HOLD) {
                Map<String, String> alert = new HashMap<>();
                alert.put("type", "warning");
                alert.put("title", "Project On Hold: " + p.getName());
                alert.put("message", "Waiting for clearance.");
                alerts.add(alert);
            } else if (status == ProjectStatus.RUNNING && p.getLabourCount() < 5) {
                Map<String, String> alert = new HashMap<>();
                alert.put("type", "info");
                alert.put("title", "Low Labour: " + p.getName());
                alert.put("message", "Only " + p.getLabourCount() + " workers.");
                alerts.add(alert);
            }
        }
        return alerts;
    }
}