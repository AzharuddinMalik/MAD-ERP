package net.engineeringdigest.journalApp.dto.auth;
import lombok.Data;

@Data
public class WeeklyUpdateDTO {
    private Long projectId;
    private int labourCount;
    private String remark;
}