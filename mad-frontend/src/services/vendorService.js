import api from '../api/axiosConfig';

export const vendorService = {
    getAll: async () => {
        const { data } = await api.get('/admin/vendors');
        return data;
    },
    getById: async (id) => {
        const { data } = await api.get(`/admin/vendors/${id}`);
        return data;
    },
    create: async (vendor) => {
        const { data } = await api.post('/admin/vendors', vendor);
        return data;
    },
    update: async (id, vendor) => {
        const { data } = await api.put(`/admin/vendors/${id}`, vendor);
        return data;
    },
    delete: async (id) => {
        await api.delete(`/admin/vendors/${id}`);
    },
    getAudit: async (id, params) => {
        const { data } = await api.get(`/admin/vendors/${id}/audit`, { params });
        return data;
    },
    generateInvoice: async (id, requisitionIds) => {
        const { data } = await api.post(`/admin/vendors/${id}/invoice`, requisitionIds);
        return data;
    },

    /**
     * Generate invoice from selected requisitions AND download the PDF
     * in a single request. Returns a Blob that triggers a file download.
     */
    generateInvoicePdf: async (vendorId, requisitionIds) => {
        try {
            const response = await api.post(
                `/admin/vendors/${vendorId}/invoice/pdf`,
                requisitionIds,
                { responseType: 'blob' }
            );

            // Extract filename from Content-Disposition header
            const disposition = response.headers['content-disposition'];
            let filename = 'MAD-Invoice.pdf';
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match) filename = match[1];
            }

            // Trigger browser download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true, filename };
        } catch (error) {
            // When responseType is 'blob', error response data is also a Blob.
            // Re-throw so the component mutation handler can parse it.
            throw error;
        }
    },

    /**
     * Download an existing invoice PDF by invoice ID.
     */
    downloadInvoicePdf: async (vendorId, invoiceId) => {
        const response = await api.get(
            `/admin/vendors/${vendorId}/invoice/${invoiceId}/pdf`,
            { responseType: 'blob' }
        );

        const disposition = response.headers['content-disposition'];
        let filename = `MAD-Invoice-${invoiceId}.pdf`;
        if (disposition) {
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
    }
};
