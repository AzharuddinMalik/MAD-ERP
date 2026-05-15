package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String uri;

    private int status;

    private long duration;

    private String ipAddress;

    // Default constructor for JPA
    public AuditLog() {}

    // Constructor used by AuditLogService
    public AuditLog(String username, String method, String uri, int status, long duration, String ipAddress) {
        this.username = username;
        this.method = method;
        this.uri = uri;
        this.status = status;
        this.duration = duration;
        this.ipAddress = ipAddress;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getUri() { return uri; }
    public void setUri(String uri) { this.uri = uri; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public long getDuration() { return duration; }
    public void setDuration(long duration) { this.duration = duration; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
