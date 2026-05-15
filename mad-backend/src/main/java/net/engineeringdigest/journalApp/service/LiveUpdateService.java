package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.SiteUpdateDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.scheduling.annotation.Scheduled;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 📡 LiveUpdateService: Manages Real-time Dashboard Broadcasting (SSE)
 * Renamed from NotificationService to avoid conflict with Email Notification system.
 */
@Service
@Slf4j
public class LiveUpdateService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 mins timeout
        
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        emitters.add(emitter);
        
        // Send initial connect event
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data("Connected to Live Updates"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }
        
        return emitter;
    }

    /**
     * 💓 Keep-Alive Heartbeat: Prevents connection timeouts from proxies/browsers.
     * Runs every 20 seconds.
     */
    @Scheduled(fixedRate = 20000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("ping")
                        .data("heartbeat"));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            log.info("Cleaned up {} dead SSE connections during heartbeat", deadEmitters.size());
        }
    }

    public void broadcastSiteUpdate(SiteUpdateDTO update) {
        broadcastEvent("SITE_UPDATE", update);
    }

    public void broadcastRequisition(Object requisition) {
        broadcastEvent("NEW_REQUISITION", requisition);
    }

    public void broadcastRequisitionAssigned(Object requisition) {
        broadcastEvent("REQUISITION_ASSIGNED", requisition);
    }

    public void broadcastRequisitionReceived(Object requisition) {
        broadcastEvent("REQUISITION_RECEIVED", requisition);
    }

    public void broadcastInvoiceGenerated(Object invoice) {
        broadcastEvent("INVOICE_GENERATED", invoice);
    }

    private void broadcastEvent(String name, Object data) {
        if (emitters.isEmpty()) return;
        log.info("Broadcasting {} to {} subscribers", name, emitters.size());
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(name)
                        .data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }
}
