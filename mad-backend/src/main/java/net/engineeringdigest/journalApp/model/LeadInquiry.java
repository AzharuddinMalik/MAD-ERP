package net.engineeringdigest.journalApp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores every lead/inquiry submitted via:
 *  - Hero "Talk to an Expert" form
 *  - Contact "Book Free Site Visit" form
 */
@Entity
@Table(name = "lead_inquiries")
public class LeadInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 15)
    private String phone;

    private String email;

    private String city;

    private String serviceNeeded;

    @Column(length = 1000)
    private String message;

    /** "hero" or "contact" — which form submitted this */
    private String source;

    private boolean whatsappConsent;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    /** NEW / CONTACTED / CLOSED */
    private String status = "NEW";

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ──────────────────────────────────

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getServiceNeeded() { return serviceNeeded; }
    public void setServiceNeeded(String serviceNeeded) { this.serviceNeeded = serviceNeeded; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public boolean isWhatsappConsent() { return whatsappConsent; }
    public void setWhatsappConsent(boolean whatsappConsent) { this.whatsappConsent = whatsappConsent; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
