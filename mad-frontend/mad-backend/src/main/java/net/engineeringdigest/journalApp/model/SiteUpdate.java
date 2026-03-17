package net.engineeringdigest.journalApp.model;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_updates")
public class SiteUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Link to the Project entity to get Project Name automatically
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "photo_url_1")
    private String photoUrl1;

    @Column(name = "photo_url_2")
    private String photoUrl2;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    // Default Constructor
    public SiteUpdate() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getPhotoUrl1() { return photoUrl1; }
    public void setPhotoUrl1(String photoUrl1) { this.photoUrl1 = photoUrl1; }

    public String getPhotoUrl2() { return photoUrl2; }
    public void setPhotoUrl2(String photoUrl2) { this.photoUrl2 = photoUrl2; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}