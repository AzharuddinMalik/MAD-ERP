# MAD-ERP: Detailed Feature Breakdown

## 📊 Financial Intelligence Module
The financial heart of MAD-ERP ensures transparency and liquidity tracking.

### Vendor Financial Ledger
- **Dynamic Balance Calculation**: Automatically calculates outstanding amounts based on approved requisitions vs payments made.
- **Audit Trails**: Every ledger entry is linked to a specific material requisition or payment voucher.
- **Export Capabilities**: Generate PDF/CSV reports for vendor reconciliations.

### Material Requisition Pipeline
- **Smart Assignment**: Link requisitions to specific vendors with real-time rate comparison.
- **Approval Workflows**: Multi-stage approval for high-value orders.

## 🎨 Industrial Elegance UI
A UI designed for the construction site and the boardroom.

### Dashboard 2.0
- **Project Profitability Heatmaps**: Visual indicators for project health.
- **Real-time Metrics**: Live counters for total labor on site and pending deliveries.

### Smart measurement Book (BOQ)
- **High-Density Data**: Manage hundreds of line items without losing context.
- **Revision History**: Track changes to BOQ measurements over time with supervisor signatures.

## 👷 Labour & Attendance
- **Conflict Resolution**: Prevents a worker from being marked present at two sites simultaneously.
- **Automatic Wage Calculation**: Computes daily/weekly wages based on site-specific rates.
- **Supervisor Validation**: QR-code ready architecture for future attendance hardware integration.

## 🛠 Admin & Security
- **JWT Hardening**: Stateless tokens with automatic expiration.
- **CORS Management**: Secure communication between frontend and backend.
- **Rate Limiting**: Protection against brute-force attacks on sensitive endpoints.
