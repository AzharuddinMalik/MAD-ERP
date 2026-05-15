package net.engineeringdigest.journalApp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import net.engineeringdigest.journalApp.model.MaterialRequisition;
import net.engineeringdigest.journalApp.model.VendorInvoice;
import net.engineeringdigest.journalApp.model.VendorInvoiceItem;
import net.engineeringdigest.journalApp.repository.VendorInvoiceRepository;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 🖨️ PDF Generation Service
 * Renders the vendor_invoice.html Thymeleaf template into a downloadable PDF
 * using Flying Saucer (OpenPDF backend).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfGeneratorService {

    private final TemplateEngine templateEngine;
    private final VendorInvoiceRepository invoiceRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy");

    /**
     * Generate a PDF byte array for the given invoice ID.
     */
    public byte[] generateInvoicePdf(Long invoiceId) {
        VendorInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

        // Populate Thymeleaf context with invoice data
        Context ctx = new Context();

        // ── Company Info (hardcoded branding) ──
        ctx.setVariable("companyGstin", "09AAAAA0000A1Z5");
        ctx.setVariable("companyPan", "AAAAA0000A");

        // ── Invoice Metadata ──
        ctx.setVariable("invoiceNumber", invoice.getInvoiceNumber());
        ctx.setVariable("invoiceDate", invoice.getInvoiceDate() != null
                ? invoice.getInvoiceDate().format(DATE_FMT) : "N/A");
        ctx.setVariable("invoiceStatus", invoice.getStatus());

        // ── Vendor Details ──
        ctx.setVariable("vendorName", invoice.getVendor().getName());
        ctx.setVariable("vendorAddress", invoice.getVendor().getAddress());
        ctx.setVariable("vendorPhone", invoice.getVendor().getPhone());
        ctx.setVariable("vendorEmail", invoice.getVendor().getEmail());
        ctx.setVariable("vendorGst", invoice.getVendor().getGstNumber());
        ctx.setVariable("vendorBankName", invoice.getVendor().getBankName());
        ctx.setVariable("vendorAccountNo", invoice.getVendor().getAccountNumber());
        ctx.setVariable("vendorIfsc", invoice.getVendor().getIfscCode());
        ctx.setVariable("paymentTerms", invoice.getVendor().getPaymentTerms());

        // ── Line Items ──
        List<Map<String, Object>> lineItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalGst = BigDecimal.ZERO;

        for (VendorInvoiceItem item : invoice.getLineItems()) {
            Map<String, Object> row = new HashMap<>();
            row.put("description", item.getDescription());

            // Pull quantity/unit/price from the linked MaterialRequisition
            MaterialRequisition req = item.getRequisition();
            if (req != null) {
                row.put("quantity", req.getQuantity() != null ? req.getQuantity() : 0);
                row.put("unit", req.getUnitOfMeasure() != null ? req.getUnitOfMeasure() : "Nos");
                row.put("unitPrice", req.getUnitPrice() != null ? req.getUnitPrice() : BigDecimal.ZERO);
                BigDecimal lineTotal = req.getTotalCost() != null ? req.getTotalCost() : BigDecimal.ZERO;
                row.put("amount", lineTotal);
                subtotal = subtotal.add(lineTotal);
                if (req.getGstAmount() != null) {
                    totalGst = totalGst.add(req.getGstAmount());
                }
            } else {
                row.put("quantity", 0);
                row.put("unit", "Nos");
                row.put("unitPrice", BigDecimal.ZERO);
                row.put("amount", item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO);
                subtotal = subtotal.add(item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO);
            }

            lineItems.add(row);
        }

        ctx.setVariable("lineItems", lineItems);
        ctx.setVariable("subtotal", subtotal);
        ctx.setVariable("gstAmount", totalGst);
        ctx.setVariable("grandTotal", subtotal.add(totalGst));
        ctx.setVariable("amountInWords", convertToWords(subtotal.add(totalGst)));

        // ── Render HTML from Thymeleaf ──
        String html = templateEngine.process("vendor_invoice", ctx);

        // ── Clean HTML for XML compliance (fix for naked ampersands breaking PDF engine) ──
        // Flying Saucer requires valid XML. We must escape '&' that are not part of an entity.
        html = html.replaceAll("&(?![a-zA-Z0-9#]+;)", "&amp;");

        // ── Convert HTML → PDF via Flying Saucer ──
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            log.info("PDF generated for invoice: {}", invoice.getInvoiceNumber());
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice {}: {}", invoiceId, e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Amount-to-Words Converter (Indian Numbering System)
    // ═══════════════════════════════════════════════════════════════
    private String convertToWords(BigDecimal amount) {
        long rupees = amount.longValue();
        int paise = amount.remainder(BigDecimal.ONE).movePointRight(2).intValue();

        if (rupees == 0 && paise == 0) return "Zero Rupees Only";

        StringBuilder sb = new StringBuilder();
        sb.append("Rupees ");
        sb.append(numberToWords(rupees));

        if (paise > 0) {
            sb.append(" and ");
            sb.append(numberToWords(paise));
            sb.append(" Paise");
        }
        sb.append(" Only");
        return sb.toString().trim();
    }

    private String numberToWords(long n) {
        if (n == 0) return "";

        String[] ones = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
                "Eighteen", "Nineteen"};
        String[] tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};

        if (n < 0) return "Minus " + numberToWords(-n);
        if (n < 20) return ones[(int) n];
        if (n < 100) return tens[(int) (n / 10)] + (n % 10 != 0 ? " " + ones[(int) (n % 10)] : "");
        if (n < 1000) return ones[(int) (n / 100)] + " Hundred" + (n % 100 != 0 ? " and " + numberToWords(n % 100) : "");
        if (n < 100000) return numberToWords(n / 1000) + " Thousand" + (n % 1000 != 0 ? " " + numberToWords(n % 1000) : "");
        if (n < 10000000) return numberToWords(n / 100000) + " Lakh" + (n % 100000 != 0 ? " " + numberToWords(n % 100000) : "");
        return numberToWords(n / 10000000) + " Crore" + (n % 10000000 != 0 ? " " + numberToWords(n % 10000000) : "");
    }
}
