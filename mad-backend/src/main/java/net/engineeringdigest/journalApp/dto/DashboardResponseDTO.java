package net.engineeringdigest.journalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.engineeringdigest.journalApp.model.CityStats;

import java.util.List;
import java.util.Map;

/**
 * 📦 Unified Dashboard Response DTO.
 * Coordinates multiple data streams into a single contract for the frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDTO {
    private Map<String, Object> globalStats;
    private List<CityStats> cityStats;
    private List<SiteUpdateDTO> siteUpdates;
    private List<Map<String, Object>> alerts;
    // Optional: add topProjects or recentLeads if needed in the future
}
