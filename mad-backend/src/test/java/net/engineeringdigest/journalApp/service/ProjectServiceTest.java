package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.dto.ProjectListDTO;
import net.engineeringdigest.journalApp.dto.ProjectRequestDTO;
import net.engineeringdigest.journalApp.model.City;
import net.engineeringdigest.journalApp.model.Project;
import net.engineeringdigest.journalApp.model.ProjectStatus;
import net.engineeringdigest.journalApp.repository.CityRepository;
import net.engineeringdigest.journalApp.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 🧪 Phase 2 Test: ProjectService (Unit)
 * Uses concrete TestProjectListDTO to avoid interface proxy NPEs.
 */
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock ProjectRepository projectRepo;
    @Mock CityRepository cityRepo;
    @Mock AuditLogService auditLogService;
    @InjectMocks ProjectService projectService;
    @Captor ArgumentCaptor<Project> projectCaptor;

    // ── Concrete test implementation of ProjectListDTO ──
    static class TestProjectListDTO implements ProjectListDTO {
        private final Long id;
        private final String name;
        private final String clientName;
        private final String location;
        private final Integer labourCount;
        private final LocalDate startDate;
        private final ProjectStatus status;
        private final String cityName;

        TestProjectListDTO(Long id, String name, String clientName, String location,
                           Integer labourCount, LocalDate startDate, ProjectStatus status, String cityName) {
            this.id = id;
            this.name = name;
            this.clientName = clientName;
            this.location = location;
            this.labourCount = labourCount;
            this.startDate = startDate;
            this.status = status;
            this.cityName = cityName;
        }

        @Override public Long getId() { return id; }
        @Override public String getProjectName() { return name; }
        @Override public String getClientName() { return clientName; }
        @Override public String getLocation() { return location; }
        @Override public Integer getLabourCount() { return labourCount; }
        @Override public LocalDate getStartDate() { return startDate; }
        @Override public ProjectStatus getStatus() { return status; }
        @Override public CityProjection getCity() {
            return new CityProjection() {
                @Override public Long getId() { return 1L; } // Dummy ID for test
                @Override public String getName() { return cityName; }
            };
        }
        @Override public SupervisorProjection getSupervisor() { return null; }
    }

    @Test
    void B2_1_createProject_validDto_returnsDtoAndLogsAudit() {
        // Arrange
        ProjectRequestDTO dto = new ProjectRequestDTO(
            "Test Villa", "Client X", "Location", 1L, null,
            LocalDate.now(), 10, ProjectStatus.RUNNING);

        City city = new City();
        city.setId(1L);
        city.setName("Gurugram");

        Project saved = new Project();
        saved.setId(101L);
        saved.setName(dto.name());
        saved.setCity(city);

        TestProjectListDTO testDto = new TestProjectListDTO(
            101L, "Test Villa", "Client X", "Location",
            10, LocalDate.now(), ProjectStatus.RUNNING, "Gurugram");

        when(cityRepo.findById(1L)).thenReturn(Optional.of(city));
        when(projectRepo.save(any(Project.class))).thenReturn(saved);
        when(projectRepo.findProjectedById(101L)).thenReturn(Optional.of(testDto));

        // Act
        ProjectListDTO result = projectService.createProject(dto, "admin");

        // Assert — DTO content
        assertThat(result).isNotNull();
        assertThat(result.getProjectName()).isEqualTo("Test Villa");
        assertThat(result.getCity().getName()).isEqualTo("Gurugram");

        // Assert — Entity was correctly populated
        verify(projectRepo).save(projectCaptor.capture());
        Project captured = projectCaptor.getValue();
        assertThat(captured.getName()).isEqualTo("Test Villa");
        assertThat(captured.getCity().getId()).isEqualTo(1L);

        // Assert — Audit logged
        verify(auditLogService).saveAuditLog(
            eq("admin"), eq("PROJECT_CREATED"), eq("/api/v1/projects"),
            eq(201), eq(0L), contains("101"));
    }

    @Test
    void B2_2_createProject_invalidCityId_throwsNotFound() {
        ProjectRequestDTO dto = new ProjectRequestDTO(
            "Test", "Client", "Loc", 999L, null, LocalDate.now(), 5, ProjectStatus.RUNNING);
        when(cityRepo.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.createProject(dto, "admin"))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("City not found: 999");

        verify(projectRepo, never()).save(any());
        verify(auditLogService, never()).saveAuditLog(any(), any(), any(), anyInt(), anyLong(), any());
    }
}
