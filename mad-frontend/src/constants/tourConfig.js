export const tourConfig = {
    dashboard: [
        {
            target: '[data-tour="kpi-cards"]',
            title: "Performance Metrics",
            content: "Track your active sites, workforce capacity, and critical alerts in real-time.",
            position: "bottom"
        },
        {
            target: '[data-tour="alerts-panel"]',
            title: "Critical Signals",
            content: "Immediate action required items appear here. Stay on top of site issues.",
            position: "top"
        },
        {
            target: '[data-tour="live-updates"]',
            title: "Live Site Signal",
            content: "Watch site progress photos and updates as they happen across all regions.",
            position: "left"
        }
    ],
    leads: [
        {
            target: '[data-tour="leads-table"]',
            title: "Inquiry Pipeline",
            content: "All incoming prospects from your landing page are automatically synchronized here.",
            position: "bottom"
        },
        {
            target: '[data-tour="lead-status"]',
            title: "Lifecycle Management",
            content: "Cycle through status stages (New → Contacted → Closed) with a single click.",
            position: "right"
        }
    ],
    inventory: [
        {
            target: '[data-tour="inventory-tabs"]',
            title: "Stock vs Orders",
            content: "Toggle between your global material manifest and active vendor requisitions.",
            position: "bottom"
        },
        {
            target: '[data-tour="register-stock"]',
            title: "Inventory Control",
            content: "Register new materials and link them to specific projects and verified vendors.",
            position: "bottom"
        }
    ]
};
