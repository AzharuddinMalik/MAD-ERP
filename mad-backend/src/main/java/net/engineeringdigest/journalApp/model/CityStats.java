package net.engineeringdigest.journalApp.model;

public class CityStats {
    private String city;
    private long totalProjects;
    private long runningCount;
    private long completedCount;

    public CityStats(String city, long totalProjects, long runningCount, long completedCount) {
        this.city = city;
        this.totalProjects = totalProjects;
        this.runningCount = runningCount;
        this.completedCount = completedCount;
    }

    // Getters
    public String getCity() { return city; }
    public long getTotalProjects() { return totalProjects; }
    public long getRunningCount() { return runningCount; }
    public long getCompletedCount() { return completedCount; }

    // Setters
    public void setCity(String city) { this.city = city; }
    public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
    public void setRunningCount(long runningCount) { this.runningCount = runningCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }
}
