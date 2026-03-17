Project: Malik Art Decor Enterprise Resource Planning (MAD-ERP)
1. Project OverviewProject Name & Codename: Malik Art Decor Enterprise Resource Planning (MAD-ERP)Elevator Pitch: MAD-ERP is a centralized, enterprise-grade web application designed to digitize and streamline contractor operations for Malik Art Decor. It replaces fragmented manual tracking (notebooks, WhatsApp) with a secure, role-based platform. The system provides real-time visibility into project status, labour deployment, site progress, and material tracking across multiple cities (Jaipur, Mumbai, Hyderabad, Aurangabad), enabling data-driven decisions and remote monitoring.Business Goals:Centralization: Consolidate data from all sites into a single source of truth.Accountability: Enforce digital reporting habits for Site Supervisors (Labour & Measurements).Scalability: Infrastructure capable of handling growth in projects and cities.Financial Control: Track estimated vs. actual material usage and labour costs.Security: Protect sensitive data via Role-Based Access Control (RBAC).
2. Scope & DeliverablesIn-Scope Features:Authentication: Secure JWT-based login with RBAC (Admin vs. Supervisor).Admin Dashboard: Visualization of Total Projects, Active Sites, Total Labour, and Alerts.Project Management: CRUD for Projects and Cities.Smart Measurement Book: Digital BOQ tracking with auto-calculation (SFT/RFT) and scope validation.Supervisor Workflow: "My Projects" view, Daily Labour Updates, and Measurement Entry.Reporting: Automated calculation of progress and material consumption.Out-of-Scope (Phase 1):Native Mobile App (Web Mobile view suffices).Advanced Payroll/Invoicing Modules.Client Portal.AI Analytics.Key Deliverables:Spring Boot Backend (REST APIs).MySQL Database Schema (ER Diagram).React Frontend (Admin & Supervisor Views).API Documentation.
3. Technical SpecificationsFrontend: React (Vite)Styling: Tailwind CSS (Primary) + Material UI (Components).State: React Hooks.HTTP Client: Axios.Backend/API: Java 17 + Spring Boot 3.xArchitecture: MVC Layered.Security: Spring Security + JWT.Database: MySQL 8.0 (Hibernate/JPA).Hosting:Frontend: Vercel/Netlify (Planned).Backend: Render/AWS EC2 (Planned).DB: AWS RDS/PlanetScale (Planned).
4. Target Users & DesignPrimary User Personas:The Admin (Azharuddin): Needs a "Command Center" for global stats and financial health.The Site Supervisor (Ramesh): Needs a simple mobile interface for daily logging.Design Reference:Style: "Modern Enterprise" - clean, high contrast, professional.Palette: Slate/Dark Blue (Trust), Amber/Gold (Brand), Semantic colors (Emerald/Red).
5. Success Metrics (KPIs)100% Digital Tracking: No active project outside the system.Weekly Compliance: >95% of active sites submit updates on time.Performance: Dashboard load time < 2 seconds.Accuracy: <5% variance between digital BOQ and billing.
6. Implementation Roadmap (Phase-wise)Phase 1: Foundation (Completed/In-Progress)Goal: Secure core infrastructure and basic data flow.Tasks:[x] Set up Spring Boot Project & MySQL Database.[x] Implement JWT Authentication & RBAC (Admin/Supervisor).[x] Create Basic Entities: User, Project, City.[x] Build Admin Dashboard (Read-Only Stats).[x] Build Supervisor "My Projects" View.Phase 2: Core Operations (Next Step)Goal: Enable daily operational data entry.Tasks:[ ] Smart Measurement Backend: Implement BillOfQuantity & DailyMeasurement entities & APIs.[ ] Frontend Integration: Connect SmartMeasurementBook.jsx & DailyMeasurementsForm.jsx to backend.[ ] Validation: Enforce scope limits (prevent over-reporting).[ ] Material Tracking: Add logic to track material usage against BOQ.Phase 3: Reporting & FinancialsGoal: Turn data into insights.Tasks:[ ] Generate "Project Progress Reports" (PDF Export).[ ] Implement "Financial Snapshot" (Budget vs. Actual).[ ] Add "Alerts System" (Low Labour, Material Overuse).Phase 4: Polish & ScaleGoal: Production readiness.Tasks:[ ] Optimize Database Queries (Indexing).[ ] UI/UX Refinement (Mobile responsiveness check).[ ] Deployment to Cloud (AWS/Render). 
7. Database ER DiagramCode snippeterDiagram
USER ||--o{ PROJECT : "supervises"
USER {
bigint id PK
string username
string password
string role
}

    PROJECT ||--o{ BILL_OF_QUANTITY : "has items"
    PROJECT ||--o{ SITE_UPDATE : "has updates"
    PROJECT {
        bigint id PK
        string name
        string client_name
        string status
        date start_date
        int labour_count
        bigint city_id FK
        bigint supervisor_id FK
    }

    CITY ||--o{ PROJECT : "contains"
    CITY {
        bigint id PK
        string name
    }

    BILL_OF_QUANTITY ||--o{ DAILY_MEASUREMENT : "logs work"
    BILL_OF_QUANTITY {
        bigint id PK
        bigint project_id FK
        string item_name
        string unit
        double total_scope
        double completed_scope
        double rate
    }

    DAILY_MEASUREMENT {
        bigint id PK
        bigint boq_id FK
        date date
        double length
        double height
        double quantity
        string supervisor_name
        text remarks
    }

    SITE_UPDATE {
        bigint id PK
        bigint project_id FK
        text content
        datetime update_time
    }
8. Frontend Architecture MapThis maps how React components connect to the Spring Boot backend.React RouteComponentBackend EndpointMethodPurpose/Login.jsx/api/auth/loginPOSTAuthenticate & Get Token/dashboardDashboard.jsx/api/admin/dashboardGETGlobal Stats & Alerts/active-projectsActiveProjects.jsx/api/admin/projectsGETList all projects with status/create-projectCreateProject.jsx/api/admin/create-projectPOSTInitialize new site/api/admin/citiesGETPopulate City dropdown/supervisorSupervisorDashboard.jsx/api/supervisor/my-projectsGETList assigned projects/api/admin/daily-updatePOSTUpdate Labour Count/smart-bookSmartMeasurementBook.jsx/api/measurements/project/{id}GETGet BOQ Items & Progress(Modal)DailyMeasurementsForm.jsx/api/measurements/submitPOST