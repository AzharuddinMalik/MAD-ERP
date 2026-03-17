package net.engineeringdigest.journalApp.service;

import jakarta.mail.internet.MimeMessage;
import net.engineeringdigest.journalApp.model.LeadInquiry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String ADMIN_EMAIL;

    public void sendNewLeadNotification(LeadInquiry lead) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(ADMIN_EMAIL);
            helper.setFrom(ADMIN_EMAIL, "Malik Art Decor - Lead Alert");

            // Fix: handle null city in subject
            String city = (lead.getCity() != null && !lead.getCity().isEmpty()) ? lead.getCity() : "Unknown Location";
            String sourceBadge = "HERO".equalsIgnoreCase(lead.getSource()) ? "Hero Form" : "Contact Form";

            helper.setSubject("[NEW LEAD] " + lead.getName() + " from " + city + " via " + sourceBadge);

            // Format timestamp
            String submittedAt = lead.getSubmittedAt() != null
                    ? lead.getSubmittedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH))
                    : "Just now";

            // Safely get optional fields
            String phone = lead.getPhone() != null ? lead.getPhone() : "N/A";
            String email = (lead.getEmail() != null && !lead.getEmail().isEmpty()) ? lead.getEmail() : null;
            String service = (lead.getServiceNeeded() != null && !lead.getServiceNeeded().isEmpty()) ? lead.getServiceNeeded() : "Not specified";
            String msg = (lead.getMessage() != null && !lead.getMessage().isEmpty()) ? lead.getMessage() : null;
            String whatsapp = lead.isWhatsappConsent() ? "Yes" : "No";

            String sourceColor = "HERO".equalsIgnoreCase(lead.getSource()) ? "#4f46e5" : "#059669";
            String sourceName = "HERO".equalsIgnoreCase(lead.getSource()) ? "Hero Form" : "Contact Form";

            // Build HTML body
            String html = "<!DOCTYPE html>" +
                "<html lang='en'><head><meta charset='UTF-8'>" +
                "<style>" +
                "body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f1ee;margin:0;padding:24px;}" +
                ".card{background:#ffffff;border-radius:16px;max-width:560px;margin:0 auto;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);}" +
                ".header{background:linear-gradient(135deg,#3D2B1F 0%,#6B3F2A 100%);padding:28px 32px;}" +
                ".header h1{color:#FFF8F3;font-size:20px;margin:0 0 4px;letter-spacing:0.5px;}" +
                ".header p{color:#E8C9B8;font-size:13px;margin:0;}" +
                ".badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:" + sourceColor + ";}" +
                ".body{padding:28px 32px;}" +
                ".field{margin-bottom:16px;}" +
                ".label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9b8b80;margin-bottom:4px;}" +
                ".value{font-size:15px;color:#2d1f18;font-weight:500;}" +
                ".divider{border:none;border-top:1px solid #f0e8e0;margin:20px 0;}" +
                ".msg-box{background:#fdf6f0;border-left:4px solid #E07A5F;border-radius:0 8px 8px 0;padding:14px 16px;font-size:14px;color:#3d2b1f;font-style:italic;line-height:1.6;}" +
                ".pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;}" +
                ".pill-yes{background:#d1fae5;color:#065f46;}" +
                ".pill-no{background:#fee2e2;color:#991b1b;}" +
                ".footer{background:#fdf6f0;padding:18px 32px;border-top:1px solid #f0e8e0;font-size:12px;color:#9b8b80;text-align:center;}" +
                ".footer strong{color:#E07A5F;}" +
                "</style></head><body>" +
                "<div class='card'>" +
                "  <div class='header'>" +
                "    <h1>New Lead Received</h1>" +
                "    <p>Malik Art Decor &mdash; Lead Notification System &nbsp; <span class='badge'>" + sourceName + "</span></p>" +
                "  </div>" +
                "  <div class='body'>" +
                "    <div class='field'><div class='label'>Customer Name</div><div class='value'>" + lead.getName() + "</div></div>" +
                "    <div class='field'><div class='label'>Phone Number</div><div class='value'>" + phone + (lead.isWhatsappConsent() ? " &nbsp;<span style='font-size:12px;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-weight:600;'>WhatsApp OK</span>" : "") + "</div></div>" +
                (email != null ? "<div class='field'><div class='label'>Email Address</div><div class='value'><a href='mailto:" + email + "' style='color:#E07A5F;text-decoration:none;'>" + email + "</a></div></div>" : "") +
                "    <div class='field'><div class='label'>City / Location</div><div class='value'>" + city + "</div></div>" +
                "    <div class='field'><div class='label'>Service Interested In</div><div class='value'>" + service + "</div></div>" +
                "    <div class='field'><div class='label'>WhatsApp Updates</div><div class='value'><span class='pill " + (lead.isWhatsappConsent() ? "pill-yes'>Yes, agreed" : "pill-no'>No preference") + "</span></div></div>" +
                "    <hr class='divider'>" +
                (msg != null ? "<div class='field'><div class='label'>Customer Message</div><div class='msg-box'>&ldquo;" + msg + "&rdquo;</div></div><hr class='divider'>" : "") +
                "    <div style='display:flex;gap:24px;flex-wrap:wrap;'>" +
                "      <div class='field' style='flex:1;min-width:120px;'><div class='label'>Source Form</div><div class='value'><span class='badge'>" + sourceName + "</span></div></div>" +
                "      <div class='field' style='flex:1;min-width:120px;'><div class='label'>Submitted At</div><div class='value' style='font-size:13px;'>" + submittedAt + "</div></div>" +
                "    </div>" +
                "  </div>" +
                "  <div class='footer'>This is an automated alert from <strong>Malik Art Decor Lead System</strong>. Please respond to this lead within 30 minutes.</div>" +
                "</div>" +
                "</body></html>";

            helper.setText(html, true); // true = HTML email
            mailSender.send(message);

            System.out.println("✅ HTML lead notification sent to " + ADMIN_EMAIL + " for: " + lead.getName());
        } catch (Exception e) {
            System.err.println("❌ Failed to send lead notification email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
