package net.engineeringdigest.journalApp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.engineeringdigest.journalApp.dto.ProjectListDTO;
import net.engineeringdigest.journalApp.dto.ProjectRequestDTO;
import net.engineeringdigest.journalApp.model.ProjectInvoice;
import net.engineeringdigest.journalApp.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

/**
 * 📦 Component 4: Project Controller
 * Unified API for projects with strict DTO validation and RBAC.
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * 🟢 Endpoints: GET /api/v1/projects
     * Returns paginated projects with supervisor and city details.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Cacheable("projects")
    public ResponseEntity<Page<ProjectListDTO>> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(projectService.getAllProjects(PageRequest.of(page, size, sort)));
    }

    /**
     * 🟢 Endpoints: POST /api/v1/projects
     * Secure creation with strict validation and audit trace.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "projects", allEntries = true)
    public ResponseEntity<ProjectListDTO> createProject(
            @Valid @RequestBody ProjectRequestDTO dto, 
            Authentication authentication) {
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(dto, authentication.getName()));
    }

}
