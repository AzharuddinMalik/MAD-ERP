package net.engineeringdigest.journalApp.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import net.engineeringdigest.journalApp.dto.DashboardResponseDTO;
import net.engineeringdigest.journalApp.dto.ProjectListDTO;
import net.engineeringdigest.journalApp.dto.ProjectRequestDTO;
import net.engineeringdigest.journalApp.dto.SiteUpdateDTO;
import net.engineeringdigest.journalApp.model.*;
import net.engineeringdigest.journalApp.dto.ProjectFinancialDTO;
import net.engineeringdigest.journalApp.dto.VendorFinancialDTO;
import net.engineeringdigest.journalApp.dto.ProductivityDTO;
import net.engineeringdigest.journalApp.repository.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 📦 Component 2/4: Project Service
 * Fully refactored for production:
 * 1. Constructor Injection (Lombok @RequiredArgsConstructor)
 * 2. Optimized Projection-based Pagination
 * 3. Audited & Validated Entity Creation
 */
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final SiteUpdateRepository siteUpdateRepository;
    private final AttendanceRepository attendanceRepository;
    private final LabourRepository labourRepository;
    private final BillOfQuantityRepository boqRepository;
    private final ProjectInvoiceRepository invoiceRepository;
    private final LeadInquiryRepository leadInquiryRepository;
    private final MaterialRequisitionRepository materialRequisitionRepository;
    private final VendorRepository vendorRepository;
    private final AuditLogService auditLogService;

    /**
     * ✅ Optimized: Returns a projected Page instead of a full list.
     * Prevents N+1 queries via @EntityGraph(attributePaths = {"city", "supervisor"}) in repo.
     */
    @Transactional(readOnly = true)
    public Page<ProjectListDTO> getAllProjects(Pageable pageable) {
        return projectRepository.findAllProjectedBy(pageable);
    }

    @Transactional(readOnly = true)
    public List<ProjectListDTO> getRecentProjects(int limit) {
        return projectRepository.findTopByOrderByStartDateDesc(org.springframework.data.domain.PageRequest.of(0, limit)).getContent();
    }

    /**
     * ✅ New: Transactional project creation with safety checks and auditing.
     */
    @Transactional
    public ProjectListDTO createProject(ProjectRequestDTO dto, String actor) {
        // 🟢 FK Validation (Fail Fast)
        City city = cityRepository.findById(dto.cityId())
                .orElseThrow(() -> new EntityNotFoundException("City not found: " + dto.cityId()));

        Project project = new Project();
        project.setName(dto.name());
        project.setClientName(dto.clientName());
        project.setLocation(dto.location());
        project.setCity(city);
        project.setStartDate(dto.startDate());
        project.setLabourCount(dto.labourCount());
        project.setStatus(dto.status());

        if (dto.supervisorId() != null) {
            User supervisor = userRepository.findById(dto.supervisorId())
                    .orElseThrow(() -> new EntityNotFoundException("Supervisor not found: " + dto.supervisorId()));
            project.setSupervisor(supervisor);
        }

        Project saved = projectRepository.save(project);

        // 🔒 Audit Success (Non-blocking async call via @Async in service)
        auditLogService.saveAuditLog(
                actor, 
                "PROJECT_CREATED", 
                "/api/v1/projects", 
                201, 
                0L, 
                "Project ID: " + saved.getId()
        );

        return projectRepository.findProjectedById(saved.getId()).orElse(null);
        // 🧪 TODO: Improve mapping for newly created single record
    }

    /**
     * ✅ Unified Dashboard Entry Point (Transactional)
     * Enforces single transaction boundary for all stats and DTO mapping.
     */
    @Transactional(readOnly = true)
    @Cacheable("dashboard")
    public DashboardResponseDTO getDashboardData() {
        return DashboardResponseDTO.builder()
                .globalStats(getGlobalStats())
                .cityStats(getProjectStats())
                .siteUpdates(getRecentUpdates())
                .alerts(getDashboardAlerts())
                .build();
    }

    private List<SiteUpdateDTO> getRecentUpdates() {
        return siteUpdateRepository.findTop10ByOrderByUpdateTimeDesc().stream()
                .map(this::mapToSiteUpdateDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteUpdateDTO mapToSiteUpdateDTO(SiteUpdate update) {
        Project project = update.getProject();
        return SiteUpdateDTO.builder()
                .id(update.getId())
                .content(update.getContent())
                .photoUrl1(update.getPhotoUrl1())
                .photoUrl2(update.getPhotoUrl2())
                .updateTime(update.getUpdateTime())
                .projectId(project.getId())
                .projectName(project.getName())
                .cityName(project.getCity() != null ? project.getCity().getName() : "Unknown")
                .supervisorName(project.getSupervisor() != null ? 
                    (project.getSupervisor().getFullName() != null ? project.getSupervisor().getFullName() : project.getSupervisor().getUsername()) 
                    : "Unassigned")
                .build();
    }

    public List<CityStats> getProjectStats() {
        // Still uses full entities for internal grouping/stats logic
        List<Project> allProjects = projectRepository.findAll();
        List<CityStats> statsList = new ArrayList<>();

        Map<String, List<Project>> groupedByCity = allProjects.stream()
                .filter(p -> p.getCity() != null)
                .collect(Collectors.groupingBy(project -> project.getCity().getName()));

        for (Map.Entry<String, List<Project>> entry : groupedByCity.entrySet()) {
            String city = entry.getKey();
            List<Project> cityProjects = entry.getValue();

            long total = cityProjects.size();

            long running = cityProjects.stream()
                    .filter(p -> p.getStatus() == ProjectStatus.RUNNING)
                    .count();

            long completed = cityProjects.stream()
                    .filter(p -> p.getStatus() == ProjectStatus.COMPLETED)
                    .count();

            statsList.add(new CityStats(city, total, running, completed));
        }
        return statsList;
    }

    public Map<String, Object> getGlobalStats() {
        List<Project> allProjects = projectRepository.findAll();

        Map<String, Object> response = new HashMap<>();

        response.put("totalProjects", (long) allProjects.size());

        // Dynamic Active Count
        long activeCount = allProjects.stream()
                .filter(p -> p.getStatus() != ProjectStatus.COMPLETED)
                .count();
        response.put("activeProjects", activeCount);

        long totalLabour = labourRepository.count();
        response.put("totalLabour", totalLabour);

        long cityCount = allProjects.stream()
                .filter(p -> p.getCity() != null)
                .map(p -> p.getCity().getName())
                .distinct()
                .count();
        response.put("cityCount", cityCount);

        // Project Status Distribution
        Map<String, Long> statusDist = allProjects.stream()
                .filter(p -> p.getStatus() != null)
                .collect(Collectors.groupingBy(p -> p.getStatus().toString(), Collectors.counting()));
        response.put("projectStatusDistribution", statusDist);

        // --- Intelligence Extension ---
        // 1. Lead Conversion Funnel
        long totalLeads = leadInquiryRepository.count();
        long contactedLeads = leadInquiryRepository.countByStatus("CONTACTED");
        long closedLeads = leadInquiryRepository.countByStatus("CLOSED");
        
        Map<String, Long> leadFunnel = new HashMap<>();
        leadFunnel.put("total", totalLeads);
        leadFunnel.put("contacted", contactedLeads);
        leadFunnel.put("closed", closedLeads);
        response.put("leadFunnel", leadFunnel);

        // 2. Material Stock Alert Health
        // Simple logic: Cities with most running projects vs updates
        List<Map<String, Object>> stockHealth = new ArrayList<>();
        allProjects.stream()
            .filter(p -> p.getStatus() == ProjectStatus.RUNNING)
            .limit(5)
            .forEach(p -> {
                Map<String, Object> h = new HashMap<>();
                h.put("projectName", p.getName());
                h.put("status", p.getLabourCount() > 4 ? "HEALTHY" : "CRITICAL");
                stockHealth.add(h);
            });
        response.put("stockHealth", stockHealth);
        // ------------------------------

        // Weekly Labour Trend
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        List<Attendance> recentAttendance = attendanceRepository.findByDateBetween(startDate, today);

        Map<LocalDate, Long> attendanceByDate = recentAttendance.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()) ||
                        "HALF_DAY".equalsIgnoreCase(a.getStatus()))
                .collect(Collectors.groupingBy(
                        Attendance::getDate,
                        Collectors.counting()));

        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            long count = attendanceByDate.getOrDefault(d, 0L);
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("day", d.format(dayFormatter));
            dayStat.put("date", d.toString());
            dayStat.put("workers", count);
            trend.add(dayStat);
        }
        response.put("weeklyLabourTrend", trend);

        return response;
    }

    public List<Map<String, Object>> getDashboardAlerts() {
        List<Project> projects = projectRepository.findAll();
        List<Map<String, Object>> alerts = new ArrayList<>();

        for (Project p : projects) {
            ProjectStatus status = p.getStatus();
            if (status == null)
                continue;

            Map<String, Object> alert = new HashMap<>();
            boolean isAlert = false;

            if (status == ProjectStatus.DELAYED) {
                alert.put("type", "CRITICAL");
                alert.put("title", "Project Delayed: " + p.getName());
                alert.put("message", "Immediate attention required. Timeline severely compromised.");
                isAlert = true;
            } else if (status == ProjectStatus.ON_HOLD) {
                alert.put("type", "WARNING");
                alert.put("title", "Project On Hold: " + p.getName());
                alert.put("message", "Waiting for clearance or material supply.");
                isAlert = true;
            } else if (status == ProjectStatus.RUNNING && p.getLabourCount() < 5) {
                alert.put("type", "INFO");
                alert.put("title", "Low Labour: " + p.getName());
                alert.put("message", "Only " + p.getLabourCount() + " workers on site. Risk of delay.");
                isAlert = true;
            }

            if (isAlert) {
                alert.put("projectId", p.getId());
                alert.put("projectName", p.getName());
                alert.put("location", p.getLocation() != null ? p.getLocation() : "Unknown Location");
                alert.put("supervisorName", p.getSupervisor() != null ? (p.getSupervisor().getFullName() != null ? p.getSupervisor().getFullName() : p.getSupervisor().getUsername()) : "Unassigned");
                alert.put("labourCount", p.getLabourCount());
                alerts.add(alert);
            }
        }
        return alerts;
    }
    @Transactional
    public ProjectInvoice finalizeProject(Long projectId, String actor, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));

        Optional<ProjectInvoice> existingInvoice = invoiceRepository.findAll().stream()
                .filter(i -> i.getProject().getId().equals(projectId))
                .findFirst();

        if (existingInvoice.isPresent()) {
            if (project.getStatus() != ProjectStatus.INVOICED) {
                project.setStatus(ProjectStatus.INVOICED);
                projectRepository.save(project);
            }
            return existingInvoice.get();
        }

        // --- RBAC Compromise: Daily Report check ---
        long siteUpdatesCount = siteUpdateRepository.findAll().stream()
                .filter(u -> u.getProject().getId().equals(projectId))
                .count();

        if (siteUpdatesCount == 0) {
            if (!isAdmin) {
                // Strict block for Supervisors
                throw new IllegalStateException("Conflict: Cannot finalize project without at least one Daily Report (Site Update). Please submit updates first.");
            } else {
                // Soft warning override for Admins
                auditLogService.saveAuditLog(
                        actor,
                        "PROJECT_FINALIZE_WARNING",
                        "/api/admin/projects/" + projectId + "/finalize",
                        200,
                        0L,
                        "Admin finalized project " + projectId + " without any Daily Reports."
                );
            }
        }
        // -------------------------------------------

        List<BillOfQuantity> boqItems = boqRepository.findByProjectId(projectId);
        double totalAmount = boqItems.stream()
                .mapToDouble(item -> item.getCompletedScope() * item.getRate())
                .sum();

        ProjectInvoice invoice = new ProjectInvoice();
        invoice.setProject(project);
        invoice.setTotalAmount(totalAmount);
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis() + "-" + projectId);
        ProjectInvoice savedInvoice = invoiceRepository.save(invoice);

        project.setStatus(ProjectStatus.INVOICED);
        projectRepository.save(project);

        auditLogService.saveAuditLog(
                actor,
                "PROJECT_INVOICED",
                "/api/v1/projects/" + projectId + "/finalize",
                200,
                0L,
                "Invoice ID: " + savedInvoice.getId() + ", Amount: " + totalAmount
        );

        return savedInvoice;
    }
    
    /**
     * 💰 Financial Intelligence Calculation
     * Computes ROI and expense metrics for a specific project.
     */
    @Transactional(readOnly = true)
    public ProjectFinancialDTO getProjectFinancials(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        // 1. Calculate Revenue (Work Done Value from BOQ)
        List<BillOfQuantity> boqs = boqRepository.findByProject(project);
        double totalBudget = boqs.stream().mapToDouble(b -> b.getTotalScope() * b.getRate()).sum();
        double workDoneValue = boqs.stream().mapToDouble(BillOfQuantity::getCurrentBillValue).sum();

        // 2. Calculate Material Expenses (Finalized Requisitions)
        List<MaterialRequisition> requisitions = materialRequisitionRepository.findByProject(project);
        BigDecimal materialExpense = requisitions.stream()
                .filter(r -> "RECEIVED".equals(r.getStatus()) || "DISPATCHED".equals(r.getStatus()))
                .map(r -> r.getTotalCost() != null ? r.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Calculate Labour Expenses (Daily Wages * Attendance)
        List<Attendance> attendance = attendanceRepository.findByProject(project);
        double labourExpense = attendance.stream()
                .filter(a -> "PRESENT".equals(a.getStatus()))
                .mapToDouble(a -> a.getLabour().getDailyWage() != null ? a.getLabour().getDailyWage() : 0.0)
                .sum();
        
        // Half day logic
        double halfDayExpense = attendance.stream()
                .filter(a -> "HALF_DAY".equals(a.getStatus()))
                .mapToDouble(a -> (a.getLabour().getDailyWage() != null ? a.getLabour().getDailyWage() : 0.0) / 2.0)
                .sum();

        BigDecimal totalLabour = BigDecimal.valueOf(labourExpense + halfDayExpense);
        BigDecimal totalExp = materialExpense.add(totalLabour);
        BigDecimal currentROI = BigDecimal.valueOf(workDoneValue).subtract(totalExp);

        double healthScore = totalBudget > 0 ? ((totalBudget - totalExp.doubleValue()) / totalBudget) * 100 : 0;

        return ProjectFinancialDTO.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .totalBudget(BigDecimal.valueOf(totalBudget))
                .workDoneValue(BigDecimal.valueOf(workDoneValue))
                .materialExpense(materialExpense)
                .labourExpense(totalLabour)
                .totalExpense(totalExp)
                .currentROI(currentROI)
                .healthScore(Math.max(0, healthScore))
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProjectFinancialDTO> getAllFinancials() {
        return projectRepository.findAll().stream()
                .map(p -> getProjectFinancials(p.getId()))
                .collect(Collectors.toList());
    }

    /**
     * 🧾 Vendor Ledger Analysis
     */
    @Transactional(readOnly = true)
    public List<VendorFinancialDTO> getVendorFinancials() {
        List<Vendor> vendors = vendorRepository.findAll();
        return vendors.stream().map(v -> {
            List<MaterialRequisition> requisitions = materialRequisitionRepository.findByVendor(v);
            
            BigDecimal totalOrder = requisitions.stream()
                    .filter(r -> !"REJECTED".equals(r.getStatus()))
                    .map(r -> r.getTotalCost() != null ? r.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaid = requisitions.stream()
                    .filter(r -> "PAID".equals(r.getPaymentStatus()))
                    .map(r -> r.getTotalCost() != null ? r.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return VendorFinancialDTO.builder()
                    .vendorId(v.getId())
                    .vendorName(v.getName())
                    .totalOrderValue(totalOrder)
                    .totalPaid(totalPaid)
                    .pendingBalance(totalOrder.subtract(totalPaid))
                    .orderCount(requisitions.size())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void markRequisitionAsPaid(Long id) {
        MaterialRequisition requisition = materialRequisitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found"));
        requisition.setPaymentStatus("PAID");
        materialRequisitionRepository.save(requisition);
        
        auditLogService.saveAuditLog(
            "SYSTEM",
            "VENDOR_PAYMENT_SETTLED",
            "/api/v1/admin/financials/requisition/" + id + "/pay",
            200,
            id,
            "Requisition marked as PAID. Amount: " + requisition.getTotalCost()
        );
    }

    /**
     * ⚡ Productivity Intelligence Engine
     */
    @Transactional(readOnly = true)
    public ProductivityDTO getProjectProductivity(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        // 1. Calculate Man-Days
        List<Attendance> attendance = attendanceRepository.findByProject(project);
        double fullDays = attendance.stream().filter(a -> "PRESENT".equals(a.getStatus())).count();
        double halfDays = attendance.stream().filter(a -> "HALF_DAY".equals(a.getStatus())).count() * 0.5;
        double totalManDays = fullDays + halfDays;

        // 2. Calculate Work Value Produced
        List<BillOfQuantity> boqs = boqRepository.findByProject(project);
        double workDoneValue = boqs.stream().mapToDouble(BillOfQuantity::getCurrentBillValue).sum();
        double totalBudget = boqs.stream().mapToDouble(b -> b.getTotalScope() * b.getRate()).sum();

        // 3. Labour Productivity (Value per Man-Day)
        BigDecimal valuePerManDay = totalManDays > 0 
            ? BigDecimal.valueOf(workDoneValue).divide(BigDecimal.valueOf(totalManDays), 2, BigDecimal.ROUND_HALF_UP) 
            : BigDecimal.ZERO;

        // 4. Material Wastage Ratio
        List<MaterialRequisition> requisitions = materialRequisitionRepository.findByProject(project);
        BigDecimal actualExpense = requisitions.stream()
                .filter(r -> !"REJECTED".equals(r.getStatus()))
                .map(r -> r.getTotalCost() != null ? r.getTotalCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        double wastageRatio = totalBudget > 0 ? (actualExpense.doubleValue() / totalBudget) : 0;

        // 5. Timeline Prediction
        // Simple logic: If we spent X man-days to do Y value, how many more man-days for remaining value?
        double remainingValue = totalBudget - workDoneValue;
        int daysRemaining = 0;
        if (workDoneValue > 0 && totalManDays > 0) {
            long daysElapsed = ChronoUnit.DAYS.between(project.getStartDate(), LocalDate.now());
            double valuePerDay = workDoneValue / Math.max(1, daysElapsed);
            daysRemaining = valuePerDay > 0 ? (int) (remainingValue / valuePerDay) : 0;
        }

        return ProductivityDTO.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .supervisorName(project.getSupervisor() != null ? project.getSupervisor().getUsername() : "Unassigned")
                .totalManDays((long) totalManDays)
                .valueProducedPerManDay(valuePerManDay)
                .materialWastageRatio(BigDecimal.valueOf(wastageRatio))
                .daysRemaining(Math.max(0, daysRemaining))
                .predictedCompletionDate(LocalDate.now().plusDays(Math.max(0, daysRemaining)).toString())
                .efficiencyScore(calculateEfficiencyScore(valuePerManDay))
                .build();
    }

    private double calculateEfficiencyScore(BigDecimal valuePerManDay) {
        // Industry Benchmark: 5000 INR per man-day is target
        double benchmark = 5000.0;
        double current = valuePerManDay.doubleValue();
        return Math.min(100, (current / benchmark) * 100);
    }

    @Transactional(readOnly = true)
    public List<ProductivityDTO> getAllProductivity() {
        return projectRepository.findAll().stream()
                .map(p -> getProjectProductivity(p.getId()))
                .collect(Collectors.toList());
    }
}