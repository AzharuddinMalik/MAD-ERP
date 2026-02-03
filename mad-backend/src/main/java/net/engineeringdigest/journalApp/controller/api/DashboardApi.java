package net.engineeringdigest.journalApp.controller.api;

import net.engineeringdigest.journalApp.model.CityStats;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardApi {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/data")
    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();

        // 1. Global Stats (Cards)
        data.put("globalStats", projectService.getGlobalStats());

        // 2. City Stats (Table)
        List<CityStats> cityStats = projectService.getProjectStats();
        data.put("cityStats", cityStats);

        // 3. Raw Projects (Active Projects List)
        List<Project> projects = projectService.getAllProjects();
        data.put("projects", projects);

        // 4. Site Updates (New Dynamic Section)
        data.put("siteUpdates", projectService.getRecentUpdates());

        // 5. Alerts (New)
        data.put("alerts", projectService.getDashboardAlerts());

        return data;
    }
}