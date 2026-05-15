package net.engineeringdigest.journalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 📝 DTO for flattened Site Updates.
 * Prevents LazyInitializationException and Serialization loops by
 * extracting only required primitive/string fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteUpdateDTO {
    private int id;
    private String content;
    private String photoUrl1;
    private String photoUrl2;
    private LocalDateTime updateTime;
    
    // Flattened Project Data
    private Long projectId;
    private String projectName;
    private String cityName;
    private String supervisorName;
}
